// src-tauri/src/updater.rs
use reqwest::Client;
use std::process::Command;

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
            let mount_pt = "/Volumes/SearchCopyUpdateVol";

            let attach = Command::new("hdiutil")
                .args(["attach", dmg_str, "-mountpoint", mount_pt, "-nobrowse", "-quiet"])
                .output()
                .map_err(|e| format!("hdiutil не найден: {}", e))?;

            if !attach.status.success() {
                let err = String::from_utf8_lossy(&attach.stderr);
                return Err(format!("Ошибка монтирования: {}", err));
            }

            let copy = Command::new("sh")
                .args(["-c", &format!(
                    "rm -rf /Applications/SearchCopy.app && cp -Rf '{}/SearchCopy.app' /Applications/",
                    mount_pt
                )])
                .output()
                .map_err(|e| format!("Ошибка копирования: {}", e))?;

            let _ = Command::new("hdiutil").args(["detach", mount_pt, "-quiet"]).output();
            let _ = std::fs::remove_file(&dmg_path);

            if !copy.status.success() {
                let err = String::from_utf8_lossy(&copy.stderr);
                return Err(format!("Ошибка установки .app: {}", err));
            }

            Ok("installed".to_string())
        }

        "win" => {
            let exe_path = tmp_dir.join("SearchCopySetup.exe");
            std::fs::write(&exe_path, &bytes)
                .map_err(|e| format!("Не удалось сохранить EXE: {}", e))?;

            let exe_str = exe_path.to_str().unwrap().to_string();

            Command::new("cmd")
                .args(["/C", "start", "", &exe_str, "/S"])
                .spawn()
                .map_err(|e| format!("Не удалось запустить установщик: {}", e))?;

            Ok("installing".to_string())
        }

        "linux" => {
            let appimage_path = tmp_dir.join("SearchCopy-update.AppImage");
            std::fs::write(&appimage_path, &bytes)
                .map_err(|e| format!("Не удалось сохранить AppImage: {}", e))?;

            Command::new("chmod")
                .args(["+x", appimage_path.to_str().unwrap()])
                .output()
                .map_err(|e| format!("chmod failed: {}", e))?;

            Command::new(appimage_path.to_str().unwrap())
                .spawn()
                .map_err(|e| format!("Не удалось запустить AppImage: {}", e))?;

            Ok("installing".to_string())
        }

        _ => Err(format!("Неизвестная платформа: {}", platform)),
    }
}