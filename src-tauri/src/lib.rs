mod giga;
mod updater;
use giga::giga_search;
use updater::download_and_install;

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
    WebviewUrl, WebviewWindowBuilder,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            #[cfg(not(target_os = "android"))]
            {
                setup_tray(app)?;
                if let Err(e) = register_hotkey(app, "Ctrl+Shift+Space") { eprintln!("[hotkey] {}", e); }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, get_version, giga_search, download_and_install,
            toggle_widget, hide_widget, show_main_window, set_widget_always_on_top,
            register_widget_hotkey,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(not(target_os = "android"))]
fn register_hotkey(app: &tauri::App, hotkey: &str) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

    let app_handle = app.handle().clone();
    let shortcut_str = hotkey.to_string();

    app.global_shortcut().on_shortcut(shortcut_str.as_str(), move |_app, _shortcut, event| {
        if event.state() == ShortcutState::Pressed {
            let handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                let _ = toggle_widget(handle).await;
            });
        }
    })?;

    Ok(())
}

#[tauri::command]
async fn register_widget_hotkey(app: tauri::AppHandle, hotkey: String) -> Result<(), String> {
    #[cfg(not(target_os = "android"))]
    {
        use tauri_plugin_global_shortcut::GlobalShortcutExt;
        // Unregister all existing shortcuts first
        app.global_shortcut().unregister_all()
            .map_err(|e| e.to_string())?;
        // Register new one
        let handle = app.clone();
        app.global_shortcut().on_shortcut(hotkey.as_str(), move |_app, _shortcut, event| {
            use tauri_plugin_global_shortcut::ShortcutState;
            if event.state() == ShortcutState::Pressed {
                let h = handle.clone();
                tauri::async_runtime::spawn(async move {
                    let _ = toggle_widget(h).await;
                });
            }
        }).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn toggle_widget(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("widget") {
        if w.is_visible().unwrap_or(false) {
            let _ = w.hide();
        } else {
            let _ = w.show();
            let _ = w.set_focus();
        }
        return Ok(());
    }
    WebviewWindowBuilder::new(&app, "widget", WebviewUrl::App("widget.html".into()))
        .title("SearchCopy")
        .inner_size(320.0, 520.0)
        .min_inner_size(200.0, 120.0)
        .max_inner_size(500.0, 900.0)
        .resizable(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .shadow(true)
        .build()
        .map_err(|e: tauri::Error| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn hide_widget(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("widget") { let _ = w.hide(); }
    Ok(())
}

#[tauri::command]
async fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show(); let _ = w.set_focus(); let _ = w.unminimize();
    }
    Ok(())
}

#[tauri::command]
async fn set_widget_always_on_top(app: tauri::AppHandle, value: bool) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("widget") { let _ = w.set_always_on_top(value); }
    Ok(())
}

#[cfg(not(target_os = "android"))]
fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    let show_i   = MenuItem::with_id(app, "show",   "Открыть SearchCopy",  true, None::<&str>)?;
    let widget_i = MenuItem::with_id(app, "widget", "🔍 Виджет поиска",    true, None::<&str>)?;
    let quiz_i   = MenuItem::with_id(app, "quiz",   "🎯 Викторина дня",    true, None::<&str>)?;
    let sep      = tauri::menu::PredefinedMenuItem::separator(app)?;
    let quit_i   = MenuItem::with_id(app, "quit",   "Выход",               true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_i, &widget_i, &quiz_i, &sep, &quit_i])?;

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("SearchCopy — горячие клавиши и формулы")
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show(); let _ = w.set_focus(); let _ = w.unminimize();
                }
            }
            "widget" => {
                let app2 = app.clone();
                tauri::async_runtime::spawn(async move { let _ = toggle_widget(app2).await; });
            }
            "quiz" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.eval("currentTab='trainer';render();");
                    let _ = w.show(); let _ = w.set_focus(); let _ = w.unminimize();
                }
            }
            "quit" => { app.exit(0); }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up, ..
            } = event {
                let app = tray.app_handle().clone();
                tauri::async_runtime::spawn(async move { let _ = toggle_widget(app).await; });
            }
        })
        .build(app)?;
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String { format!("Hello, {}!", name) }

#[tauri::command]
fn get_version() -> String { env!("CARGO_PKG_VERSION").to_string() }