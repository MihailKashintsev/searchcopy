// src-tauri/src/giga.rs
// GigaChat API через reqwest — обходит CORS и самоподписанный сертификат Сбера

use reqwest::Client;
use serde_json::{json, Value};
use std::collections::HashMap;

#[tauri::command]
pub async fn giga_search(
    auth_key: String,
    system_prompt: String,
    query: String,
) -> Result<String, String> {
    // Клиент без проверки SSL — Сбер использует свой корневой сертификат
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))?;

    // ── Step 1: OAuth токен ──
    let rq_uid = uuid::Uuid::new_v4().to_string();
    let auth_header = format!("Basic {}", auth_key);

    let mut params = HashMap::new();
    params.insert("scope", "GIGACHAT_API_PERS");

    let token_res = client
        .post("https://ngw.devices.sberbank.ru:9443/api/v2/oauth")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .header("Accept", "application/json")
        .header("Authorization", &auth_header)
        .header("RqUID", &rq_uid)
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("GigaChat auth request failed: {}", e))?;

    if !token_res.status().is_success() {
        let status = token_res.status().as_u16();
        let body = token_res.text().await.unwrap_or_default();
        return Err(format!(
            "GigaChat auth error {}: {}. Проверь Authorization ключ в Настройках.",
            status, &body[..body.len().min(200)]
        ));
    }

    let token_json: Value = token_res
        .json()
        .await
        .map_err(|e| format!("Token parse error: {}", e))?;

    let access_token = token_json["access_token"]
        .as_str()
        .ok_or("access_token not found in response")?
        .to_string();

    // ── Step 2: Chat completions ──
    let body = json!({
        "model": "GigaChat",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ],
        "max_tokens": 800,
        "temperature": 0.3
    });

    let chat_res = client
        .post("https://gigachat.devices.sberbank.ru/api/v1/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("GigaChat chat request failed: {}", e))?;

    if !chat_res.status().is_success() {
        let status = chat_res.status().as_u16();
        let err_body = chat_res.text().await.unwrap_or_default();
        return Err(format!("GigaChat error {}: {}", status, &err_body[..err_body.len().min(300)]));
    }

    let chat_json: Value = chat_res
        .json()
        .await
        .map_err(|e| format!("Chat response parse error: {}", e))?;

    let text = chat_json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("[]")
        .to_string();

    Ok(text)
}