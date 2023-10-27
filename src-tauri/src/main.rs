// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


#[tauri::command]
fn markdown(text: &str) -> Result<String, String> {
    markdown::to_html_with_options(text, &markdown::Options::gfm())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, markdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} //
