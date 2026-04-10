#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Service {
    pub id: u64,
    pub provider: Address,
    pub name: String,
    pub endpoint: String,
    pub price: i128,
    pub tags: Vec<String>,
}

#[contracttype]
pub enum DataKey {
    NextId,
    Service(u64),
    AllIds,
}

#[contract]
pub struct HeekowaveContract;

#[contractimpl]
impl HeekowaveContract {
    /// Register a new API service in Heekowave
    pub fn register(
        env: Env,
        provider: Address,
        name: String,
        endpoint: String,
        price: i128,
        tags: Vec<String>,
    ) -> u64 {
        provider.require_auth();

        let mut next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);

        let service = Service {
            id: next_id,
            provider,
            name,
            endpoint,
            price,
            tags,
        };

        env.storage().persistent().set(&DataKey::Service(next_id), &service);

        let mut all_ids: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::AllIds)
            .unwrap_or(Vec::new(&env));
        all_ids.push_back(next_id);
        env.storage().instance().set(&DataKey::AllIds, &all_ids);

        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));

        next_id
    }

    /// Update the price of an existing service
    pub fn update_price(env: Env, provider: Address, id: u64, new_price: i128) {
        provider.require_auth();

        let mut service: Service = env
            .storage()
            .persistent()
            .get(&DataKey::Service(id))
            .expect("Service not found");

        if service.provider != provider {
            panic!("Unauthorized: not the provider of this service");
        }

        service.price = new_price;
        env.storage().persistent().set(&DataKey::Service(id), &service);
    }

    /// Get details of a specific service
    pub fn get_service(env: Env, id: u64) -> Option<Service> {
        env.storage().persistent().get(&DataKey::Service(id))
    }

    /// Get all registered services
    pub fn get_all_services(env: Env) -> Vec<Service> {
        let all_ids: Vec<u64> = env
            .storage()
            .instance()
            .get(&DataKey::AllIds)
            .unwrap_or(Vec::new(&env));

        let mut services = Vec::new(&env);
        for id in all_ids.into_iter() {
            if let Some(service) = Self::get_service(env.clone(), id) {
                services.push_back(service);
            }
        }
        services
    }
}
