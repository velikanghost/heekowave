#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

#[test]
fn test_register_and_get() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, HeekowaveContract);
    let client = HeekowaveContractClient::new(&env, &contract_id);

    let provider = Address::generate(&env);
    let name = String::from_str(&env, "Weather API");
    let endpoint = String::from_str(&env, "https://api.heekowave.com/weather");
    let price = 10000; // 0.01 USDC
    let tags = Vec::from_array(&env, [String::from_str(&env, "weather"), String::from_str(&env, "data")]);

    let service_id = client.register(&provider, &name, &endpoint, &price, &tags);
    assert_eq!(service_id, 1);

    let service = client.get_service(&service_id).unwrap();
    assert_eq!(service.name, name);
    assert_eq!(service.price, price);

    let all_services = client.get_all_services();
    assert_eq!(all_services.len(), 1);
}

#[test]
fn test_update_price() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, HeekowaveContract);
    let client = HeekowaveContractClient::new(&env, &contract_id);

    let provider = Address::generate(&env);
    let name = String::from_str(&env, "Trading Signals");
    let endpoint = String::from_str(&env, "https://api.heekowave.com/signals");
    let price = 50000; 
    let tags = Vec::from_array(&env, [String::from_str(&env, "finance")]);

    let service_id = client.register(&provider, &name, &endpoint, &price, &tags);

    client.update_price(&provider, &service_id, &100000);

    let service = client.get_service(&service_id).unwrap();
    assert_eq!(service.price, 100000);
}
