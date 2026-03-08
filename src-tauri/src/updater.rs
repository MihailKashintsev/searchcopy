// src-tauri/src/updater.rs
// Скачивает файл и открывает системным обработчиком (Finder/Explorer)
// Не требует прав администратора — OS сама запросит при необходимости

use reqwest::Client;

#[tauri::command]
pub async fn download_and_install(url: String, platform: String) -> Result<String, String> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(300))
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Ошибка скачивания: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP {} при скачивании обновления", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Ошибка чтения данных: {}", e))?;

    let tmp_dir = std::env::temp_dir();

    match platform.as_str() {
        "mac" => {
            let path = tmp_dir.join("SearchCopyUpdate.dmg");
            std::fs::write(&path, &bytes)
                .map_err(|e| format!("Не удалось сохранить файл: {}", e))?;

            // Открываем DMG через Finder — пользователь сам перетащит .app
            std::process::Command::new("open")
                .arg(path.to_str().unwrap())
                .spawn()
                .map_err(|e| format!("Не удалось открыть DMG: {}", e))?;

            Ok("opened".to_string())
        }

        "win" => {
            let path = tmp_dir.join("SearchCopySetup.exe");
            std::fs::write(&path, &bytes)
                .map_err(|e| format!("Не удалось сохранить файл: {}", e))?;

            // ShellExecute — Windows сам запросит UAC если нужно
            std::process::Command::new("cmd")
                .args(["/C", "start", "", path.to_str().unwrap()])
                .spawn()
                .map_err(|e| format!("Не удалось запустить установщик: {}", e))?;

            Ok("opened".to_string())
        }

        "linux" => {
            let path = tmp_dir.join("SearchCopy-update.AppImage");
            std::fs::write(&path, &bytes)
                .map_err(|e| format!("Не удалось сохранить AppImage: {}", e))?;

            std::process::Command::new("chmod")
                .args(["+x", path.to_str().unwrap()])
                .output()
                .map_err(|e| format!("chmod failed: {}", e))?;

            std::process::Command::new(path.to_str().unwrap())
                .spawn()
                .map_err(|e| format!("Не удалось запустить AppImage: {}", e))?;

            Ok("opened".to_string())
        }

        _ => Err(format!("Неизвестная платформа: {}", platform)),
    }
}