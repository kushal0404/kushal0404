var df = require('../config/define');
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
        console.log(params.transact_response.transaction.feePayer)
        let fromAccount=params.transact_response.transaction.feePayer;
        let toAccount=params.transact_response.transaction.instructions[0].keys[1].pubkey;
        let blockhash=params.transact_response.transaction.recentBlockhash;
        let memo_id=params.transact_response.meta.logMessages[3].split("\\n")[0].split("memo_id:")[1].split(",")[0];
        let signature=params.transact_signature;
        let fee=params.transact_response.meta.fee;
        let postWalletBalance=params.transact_response.meta.postBalances[0];
        return {
            sol_transferred:0,
            from_account:fromAccount!= (undefined || "") ? fromAccount.toString() : null,
            to_account:toAccount!= (undefined || "") ? toAccount : null,
            block_id:blockhash!= (undefined || "") ? blockhash : null,
            transaction_status:null,
            signature:signature!= (undefined || "") ? signature : null,
            confirmation_status:"success",
            transaction_fee:fee!= (undefined || "") ? fee : null,
            wallet_balance:postWalletBalance!= (undefined || "") ? postWalletBalance : null,
            memo_id:memo_id!= (undefined || "") ? memo_id : null,
            transaction_created_on:new Date()
        };
    },
    fileFormat: (params) => {
        return {
          file_id:null,
          public_key : null,
          file_name : null,
          mimetype : null,
          file_type : null,
          version_number : null,
          file_hash : null,
          uploaded_on :  new Date(),
          created_on : new Date()
        };
    },
}