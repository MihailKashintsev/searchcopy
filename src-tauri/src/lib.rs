mod giga;
mod updater;
use giga::giga_search;
use updater::download_and_install;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_version,
            giga_search,
            download_and_install,
            toggle_widget,
            hide_widget,
            show_main_window,
            set_widget_always_on_top,
            register_widget_hotkey,
        ]);

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .setup(|app| {
                setup_tray(app)?;
                register_default_hotkey(app);
                Ok(())
            });
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ── Desktop: tray ──
#[cfg(desktop)]
fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    use tauri::menu::{Menu, MenuItem};
    use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
    let show_i   = MenuItem::with_id(app, "show",   "Открыть SearchCopy", true, None::<&str>)?;
    let widget_i = MenuItem::with_id(app, "widget", "🔍 Виджет поиска",   true, None::<&str>)?;
    let quiz_i   = MenuItem::with_id(app, "quiz",   "🎯 Викторина дня",   true, None::<&str>)?;
    let sep      = tauri::menu::PredefinedMenuItem::separator(app)?;
    let quit_i   = MenuItem::with_id(app, "quit",   "Выход",              true, None::<&str>)?;
    let menu     = Menu::with_items(app, &[&show_i, &widget_i, &quiz_i, &sep, &quit_i])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("SearchCopy — горячие клавиши и формулы")
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
            use tauri::Manager;
            match event.id.as_ref() {
                "show" => {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.show(); let _ = w.set_focus();
                    }
                }
                "widget" => {
                    let h = app.clone();
                    tauri::async_runtime::spawn(async move { let _ = toggle_widget(h).await; });
                }
                "quiz" => {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.eval("currentTab='trainer';render();");
                        let _ = w.show(); let _ = w.set_focus();
                    }
                }
                "quit" => app.exit(0),
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up, ..
            } = event {
                let h = tray.app_handle().clone();
                tauri::async_runtime::spawn(async move { let _ = toggle_widget(h).await; });
            }
        })
        .build(app)?;
    Ok(())
}

// ── Desktop: global hotkey ──
#[cfg(desktop)]
fn register_default_hotkey(app: &tauri::App) {
    use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
    let handle = app.handle().clone();
    let _ = app.global_shortcut().on_shortcut(
        "Ctrl+Shift+Space",
        move |_app, _sc, event| {
            if event.state() == ShortcutState::Pressed {
                let h = handle.clone();
                tauri::async_runtime::spawn(async move { let _ = toggle_widget(h).await; });
            }
        },
    );
}

// ── Commands ──

#[tauri::command]
async fn toggle_widget(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if let Some(w) = app.get_webview_window("widget") {
            if w.is_visible().unwrap_or(false) {
                let _ = w.hide();
            } else {
                let _ = w.show();
                let _ = w.set_focus();
            }
        }
    }
    Ok(())
}

#[tauri::command]
async fn hide_widget(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if let Some(w) = app.get_webview_window("widget") {
            let _ = w.hide();
        }
    }
    Ok(())
}

#[tauri::command]
async fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if let Some(w) = app.get_webview_window("main") {
            let _ = w.show();
            let _ = w.set_focus();
        }
    }
    Ok(())
}

#[tauri::command]
async fn set_widget_always_on_top(app: tauri::AppHandle, value: bool) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if let Some(w) = app.get_webview_window("widget") {
            let _ = w.set_always_on_top(value);
        }
    }
    Ok(())
}

#[tauri::command]
async fn register_widget_hotkey(app: tauri::AppHandle, hotkey: String) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
        let _ = app.global_shortcut().unregister_all();
        let h = app.clone();
        app.global_shortcut()
            .on_shortcut(hotkey.as_str(), move |_app, _sc, event| {
                if event.state() == ShortcutState::Pressed {
                    let handle = h.clone();
                    tauri::async_runtime::spawn(async move {
                        let _ = toggle_widget(handle).await;
                    });
                }
            })
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String { format!("Hello, {}!", name) }

#[tauri::command]
fn get_version() -> String { env!("CARGO_PKG_VERSION").to_string() }