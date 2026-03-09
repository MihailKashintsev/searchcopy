// src-tauri/src/updater.rs
use reqwest::Client;
use std::process::Command;
use std::path::PathBuf;

#[tauri::command]
pub async fn download_and_install(url: String, platform: String) -> Result<String, String> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(300))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Ошибка скачивания: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP {} при скачивании", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Ошибка чтения данных: {}", e))?;

    let tmp_dir = std::env::temp_dir();

    match platform.as_str() {
        "mac" => {
            let dmg_path = tmp_dir.join("SearchCopyUpdate.dmg");
            std::fs::write(&dmg_path, &bytes)
                .map_err(|e| format!("Не удалось сохранить DMG: {}", e))?;

            let dmg_str = dmg_path.to_str().unwrap();

            // 1. Монтируем DMG тихо
            let attach = Command::new("hdiutil")
                .args(["attach", dmg_str, "-nobrowse", "-noautoopen", "-quiet"])
                .output()
                .map_err(|e| format!("hdiutil attach failed: {}", e))?;

            if !attach.status.success() {
                let err = String::from_utf8_lossy(&attach.stderr);
                return Err(format!("Не удалось смонтировать DMG: {}", err));
            }

            // 2. Ищем .app внутри /Volumes/
            let volumes = std::fs::read_dir("/Volumes/")
                .map_err(|e| format!("Не удалось прочитать /Volumes/: {}", e))?;

            let mut app_source: Option<PathBuf> = None;
            let mut volume_path: Option<String> = None;

            for entry in volumes.flatten() {
                let vol = entry.path();
                if let Ok(contents) = std::fs::read_dir(&vol) {
                    for item in contents.flatten() {
                        let name = item.file_name();
                        let name_str = name.to_string_lossy();
                        if name_str.ends_with(".app") {
                            app_source = Some(item.path());
                            volume_path = Some(vol.to_string_lossy().to_string());
                            break;
                        }
                    }
                }
                if app_source.is_some() { break; }
            }

            let app_src = app_source
                .ok_or("Не найдено .app в смонтированном DMG")?;
            let vol_path = volume_path.unwrap();

            let app_name = app_src.file_name().unwrap().to_string_lossy().to_string();
            let app_dest = PathBuf::from("/Applications").join(&app_name);

            // 3. Удаляем старую версию из Applications (настройки НЕ трогаем — они в ~/Library)
            if app_dest.exists() {
                Command::new("rm")
                    .args(["-rf", app_dest.to_str().unwrap()])
                    .output()
                    .map_err(|e| format!("Не удалось удалить старую версию: {}", e))?;
            }

            // 4. Копируем новую версию
            let cp = Command::new("cp")
                .args(["-R", app_src.to_str().unwrap(), "/Applications/"])
                .output()
                .map_err(|e| format!("Не удалось скопировать приложение: {}", e))?;

            if !cp.status.success() {
                let err = String::from_utf8_lossy(&cp.stderr);
                // Размонтируем даже при ошибке
                let _ = Command::new("hdiutil")
                    .args(["detach", &vol_path, "-quiet", "-force"])
                    .output();
                return Err(format!("Не удалось скопировать в Applications: {}", err));
            }

            // 5. Размонтируем DMG
            let _ = Command::new("hdiutil")
                .args(["detach", &vol_path, "-quiet", "-force"])
                .output();

            // 6. Удаляем скачанный DMG
            let _ = std::fs::remove_file(&dmg_path);

            // Возвращаем "installed" → JS перезапустит приложение
            Ok("installed".to_string())
        }

        "win" => {
            let exe_path = tmp_dir.join("SearchCopySetup.exe");
            std::fs::write(&exe_path, &bytes)
                .map_err(|e| format!("Не удалось сохранить файл: {}", e))?;

            // Тихая установка NSIS /S
            Command::new(exe_path.to_str().unwrap())
                .arg("/S")
                .spawn()
                .map_err(|e| format!("Не удалось запустить установщик: {}", e))?;

            Ok("installing".to_string())
        }

        "linux" => {
            let appimage_path = tmp_dir.join("SearchCopy-update.AppImage");
            std::fs::write(&appimage_path, &bytes)
                .map_err(|e| format!("Не удалось сохранить AppImage: {}", e))?;

            let _ = Command::new("chmod")
                .args(["+x", appimage_path.to_str().unwrap()])
                .output();

            Command::new(appimage_path.to_str().unwrap())
                .spawn()
                .map_err(|e| format!("Не удалось запустить AppImage: {}", e))?;

            Ok("installing".to_string())
        }

        _ => Err(format!("Неизвестная платформа: {}", platform)),
    }
}