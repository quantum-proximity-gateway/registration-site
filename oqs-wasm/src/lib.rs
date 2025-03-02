use oqs::{ffi::kem::{OQS_KEM_kyber_512_encaps, OQS_KEM_kyber_512_length_ciphertext, OQS_KEM_kyber_512_length_shared_secret}, *};
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
    let mut ciphertext: Vec<u8> = vec![0; OQS_KEM_kyber_512_length_ciphertext as usize];
    let mut shared_secret: Vec<u8> = vec![0; OQS_KEM_kyber_512_length_shared_secret as usize];
    unsafe {
        OQS_KEM_kyber_512_encaps(ciphertext.as_mut_ptr(), shared_secret.as_mut_ptr(), decoded_pk.as_ptr());
    }

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
    console_error_panic_hook::set_once(); // Helps with debugging errors in WASM
    let input: SharedSecretInput = serde_wasm_bindgen::from_value(data.clone()).unwrap();
    let decoded_pk: Vec<u8> = BASE64_STANDARD.decode(input.public_key_b64.clone()).unwrap();

    // Create ciphertext and shared_secret arrays
    let mut ciphertext: Vec<u8> = vec![0; OQS_KEM_kyber_512_length_ciphertext as usize];
    let mut shared_secret: Vec<u8> = vec![0; OQS_KEM_kyber_512_length_shared_secret as usize];
    unsafe {
        OQS_KEM_kyber_512_encaps(ciphertext.as_mut_ptr(), shared_secret.as_mut_ptr(), decoded_pk.as_ptr());
    }

    let ciphertext_b64: String = BASE64_STANDARD.encode(ciphertext);
    let shared_secret_b64: String = BASE64_STANDARD.encode(shared_secret);

    let result = EncapsulationResult {
        ciphertext: ciphertext_b64,
        secret: shared_secret_b64,
    };
    serde_wasm_bindgen::to_value(&result).unwrap()
}
