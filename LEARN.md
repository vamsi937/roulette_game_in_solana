# Creating a Roulette Game 
Welcome quest masters. After learning how to airdrop SOL to your wallet, let us build something interesting. In this quest you will learn how to get the wallet Balance, and transfer SOL to a wallet, all by creating an amazing Roulette Game. 
We will be working in the NodeJS environment. So, I will request you to install `npm` and `NodeJS` on your system. 
By the end of this quest, you will be ready to build more advanced things on Solana blockchain using its npm packages. 

## Game Overview and Project Initialization 
Information to be provided by user:
- `Public Key` & `Secret Key` of Wallet 
- `Amount` of SOL to be staked
- `Ratio` of stake
- Guess `Number` between 1 to 5

On successful win, the user will get the prize money (`Amount`*`Ratio`) in their wallet.

`NOTE:` Only a  maximum of `2.5 SOL` can be staked during a single guess. 

Move to the preferred location on your machine and open terminal. Create a folder named `roulette`. Make sure you have successfully installed `npm` & `Node`. To check it, type in terminal `npm -v`. It will console out the version of npm installed. For checking about NodeJS, you can type `node -v`.

Now, let's initialize a NodeJS application using the command: `npm init`. Fill in the details about the project. To directly initialize the project, use the command `npm init -y`. It will create a `package.json` file.  

## @solana/web3.js

Solana nodes accept HTTP requests using the JSON-RPC 2.0 specification.
To interact with a Solana node inside a Javascript application, we use the `solana-web3.js` library. It is available in the form of npm package as `@solana/web3.js`. 
To install execute the following command:
> npm install @solana/web3.js 

`NOTE:` For installing all the packages for the application which is already listed in `package.json` file, use the command `npm install`. 

A `node_modules` folder will be created containing files related to the package.

Now, create a file named `index.js` and lets declare a variable for the installed package. 
```sh
const web3 = require("@solana/web3.js");
```

## Establishing Connection  
First, we will establish a connection to a particular network on Solana. We use the `Connection` method from web3.js library. For this quest, we will be connected to the `devnet`. The connection constructor takes in a string representation of endpoint URL and commitment level. The end point URL can be specified using the `clusterApiUrl()` function which will return the current live endpoint to the Solana network we provide.
For our case, we will be using the `devnet` network. The code for connection will look like this:
```sh

const connection=new web3.connection(web3.clusterApiUrl("devnet"),"confirmed");
//For checking whether the connection is successfully made
console.log(connection);
```
The console will print the whole connection object with the _rpcEndpoint value as `https://api.devnet.solana.com`. Also, all the other information and objects of connection will be printed.

## Generating Address and Funds 

The winning prize for the player is airdropped here (You can also use a wallet with good amount of SOL). But for the player, they need to have a wallet from which they will be paying SOL or receiving prize. We can generate a new wallet pair using the `Keypair` method. 
```sh
const userWallet=web3.Keypair.generate();
console.log(userWallet);
```
It will be printing the Public Key and the Secret Key for the generated wallet(in Uint8 Array format). 
Store it in variables(`userPublicKey` & `userSecretKey`), if you don't want to create a new `userWallet` everytime during the execution of the application. As we can generate a wallet instance from the secret key as:
```sh
const userWallet=web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
```

You can airdrop some SOL into this wallet using the functions from the previous quest.
Now, we gave successfully established a connection, have wallets and funds in the wallet for the game. 

## Transaction Overview
For making a successful transaction, the things needed:
- `Public Key` of the from wallet address
- `Public Key` of the to wallet address
- `Amount` to be transferred 
- `From Wallet` instance for the signer

Initially, the participation amount will be from the user wallet and transferred to a `treasuryWallet`, whose secret key and wallet instance is already available. Thus, we can execute a transaction now. First, we will be creating a new transaction object. Then, we will be sending that transaction to another user and add our signature to it.


## Creating Transaction
We can start with creating a empty Transaction object. And, then we will add instructions to the Transaction object. `SystemProgram.transfer()` method is responsible for sending the funds from one account to another. It takes several arguments:
- fromPubkey: the public key of the account that we are sending funds from
- toPubkey: the public key of the account that is receiving funds from the transaction
- lamports: the amount of lamports to be sent. ( `1 SOL = 1000000000 lamports`)
The transaction variable will look like this:
```sh
const transaction=new web3.Transaction().add(
    web3.SystemProgram.transfer({
        fromPubkey:new web3.PublicKey(from.publicKey.toString()),
        toPubkey:new web3.PublicKey(to.publicKey.toString()),
        lamports:web3.LAMPORTS_PER_SOL
    })
);
```

## Signing the Transaction

We will now need to authorize the transaction by signing it with our Secret key. The signatures signal on-chain programs that the account holder has authorized the transaction. We will create a signature constant, which will store the result from `sendAndConfirmTransaction()` function.  This function accepts several arguments: 
-  connection: the connection instance 
-  transaction: the transaction constant created at the top
-  [signers]: the wallet instance of all the signers for the transaction

`NOTE:` There is also another parameter called commitment option, if it is not specified, the max commitment option will be used. 

The signature variable will look like this:
```sh
const signature=await web3.sendAndConfirmTransaction(
    connection, 
    transaction,
    [fromWalletInstance]
);
console.log('Signature is ',signature);
```
If successful, the transaction signature is printed out. 

Putting together all these in a single function, we create a function called transferSOL. It will look like this:
```sh
const transferSOL=async (from,to,transferAmt)=>{
    try{
        const connection=new web3.Connection(web3.clusterApiUrl("devnet"),"confirmed");
        const transaction=new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey:new web3.PublicKey(from.publicKey.toString()),
                toPubkey:new web3.PublicKey(to.publicKey.toString()),
                lamports:transferAmt*web3.LAMPORTS_PER_SOL
            })
        )
        const signature=await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        )
        return signature;
    }catch(err){
        console.log(err);
    }
}
```
Here, the parameters for the function is: 
- `from` refers to the from wallet instance
- `to` refers to the to wallet instance
- `transferAmt` refers to the amount in SOL to be transferred during the transaction. 
## Getting Wallet Balance

The wallet balance can be also found from the `Public Key` of the wallet using the `Connection` object. First, we establish the connection and store it in a connection variable. Then, we use the function `getBalance()` and pass in the public key. We get the balance in `LAMPORTS`. To get the balance in SOL, we divide the balance by `LAMPORTS_PER_SOL`. The resultant function will be:
```sh
const getWalletBalance=async (pubk)=>{
    try{
        const connection=new web3.Connection(web3.clusterApiUrl("devnet"),"confirmed");
        const balance=await connection.getBalance(new web3.PublicKey(pubk));
        return balance/web3.LAMPORTS_PER_SOL;
    }catch(err){
        console.log(err);
    }
}
```

## Running Application

In the terminal, change your directory to the application folder and then run command `node index.js`. It will be asking a list of questions and you can guess the number at the end.

## Conclusion

Congratulations, you have now learned how to perform a transaction on Solana network. 


