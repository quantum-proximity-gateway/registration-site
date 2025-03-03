use kyberlib::wasm::*;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use base64::prelude::*;


#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[derive(Serialize, Deserialize)]
pub struct EncapsulationResult {
    ciphertext: String,
    secret: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SharedSecretInput {
    client_id: String,
    public_key_b64: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EncryptionInput {
    plaintext: String,
    public_key_b64: String
}

#[wasm_bindgen]
pub fn generate_shared_secret(data: &JsValue) -> JsValue {
    console_error_panic_hook::set_once(); // Helps with debugging errors in WASM
    let input: SharedSecretInput = serde_wasm_bindgen::from_value(data.clone()).unwrap();
    let decoded_pk: Vec<u8> = BASE64_STANDARD.decode(input.public_key_b64.clone()).unwrap();

    // Create ciphertext and shared_secret arrays
    let result: Kex = match encapsulate(decoded_pk.into_boxed_slice()) {
        Ok(result) => result,
        Err(e) => {
            alert(&format!("Encapsulation error: {:?}", e));
            return JsValue::NULL;
        }
    };
    let ciphertext = result.ciphertext();
    let shared_secret = result.sharedSecret();

    let ciphertext_b64: String = BASE64_STANDARD.encode(ciphertext);
    let shared_secret_b64: String = BASE64_STANDARD.encode(shared_secret);

    let result = EncapsulationResult {
        ciphertext: ciphertext_b64,
        secret: shared_secret_b64,
    };
    serde_wasm_bindgen::to_value(&result).unwrap()
}

#[wasm_bindgen]
pub fn encrypt_data(data: &JsValue) -> JsValue {
    JsValue::from_str("To be implemented")
}
