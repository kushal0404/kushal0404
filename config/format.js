module.exports={
    accountformat : (request) => {
        return {
            user_name:request.body.name,
            user_surname:request.body.surname,
            user_email:request.body.email,
            user_password:request.body.name+123,
            user_phone:null,
            user_city:null,
            user_state:null,
            user_postalcode:null,
            user_beneficiaries:null,
            assigned_lawyer:null,
            assigned_customers:null,
            login_token:null,
            account_type:request.body.acc_type,
            public_key:null,
            private_key:null,
            registered_firm:"Inherit",
            wallet_balance:null,
            user_created_on:new Date()
        };
    },
    metaformat : (params) => {
        return {
            lawyer_name:params.lawyer_name,
            client_name:params.client_name,
            lawyer_postalcode:null,
            client_postalcode:null,
            type_of_doc:null,
            date_of_sign:null,
            mode_of_sign:null,
            hash_of_file:null,
            file_id:null,
            file_version:null,
            executor_name:null,
            meta_created_on:new Date()
        };
    }
}