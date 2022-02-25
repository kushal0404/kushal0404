module.exports={
    accountformat : (request) => {
        return {
            user_id:null,
            user_name:request.body.name != (undefined || "") ?request.body.name:null,
            user_surname:request.body.surname != (undefined || "") ?request.body.name:null,
            user_email:request.body.email != (undefined || "") ?request.body.name:null,
            user_password:request.body.emailname != (undefined || "") ?request.body.name+123:null,
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
            meta_data_id:null,
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
    },
    transactionFormat : (params) => {
        return {
            transaction_id:null,
            sol_transferred:null,
            from_account:null,
            to_account:null,
            block_id:null,
            transaction_status:null,
            signature:null,
            confirmation_status:null,
            transaction_fee:null,
            wallet_balance:null,
            memo_id:null,
            transaction_created_on:new Date()
        };
    }
}