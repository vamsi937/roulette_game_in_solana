# Creating a Roulette Game 
Welcome quest masters! Now that you have [learned how to airdrop SOL to your wallet](https://openquest.xyz/quest/create-an-airdrop-program-with-solana-web3.js), let's build something a little more interesting. In this quest you will learn how to get the wallet Balance and transfer SOL to a wallet all by creating an amazing Roulette game. 

By the end of this quest, you will be ready to build more advanced things on the Solana blockchain. 

Since we will be working in the NodeJS development environment, you will need to install `npm` and `NodeJS` on your system if you haven't already. You can type `npm -v` on your command-line terminal to check whether npm is installed. You should see the version of npm that you have installed. To do the same for NodeJS you can type `node -v`.

## Game Overview and Project Initialization 
Information to be provided by the player:
- The public an private keys of your wallet 
- The amount of SOL to be staked
- The ratio of stake
- The guessed number between 1 to 5

On a win, the player will receive the prize money (`amount * ratio`) in their wallet.

NOTE: Only a  maximum of 2.5 SOL can be staked during a single guess. 

Move to the preferred location on your machine and open a command line terminal. There, create a folder named `roulette`. 

Now, let's initialize a NodeJS application using the command:  

> npm init -y

That will create a `package.json` file which keeps track of all the npm packages. i.e. node packages that will be used in your project. 

## Setting up NodeJS application
Now create a file named `index.js` which will contain the code that starts this application.  Once done, open that file in your favorite code editor.

Let's start by creating a basic statement and then executing the application to get a feel for the development process. In the `index.js` file you just created, enter the following code:
```javascript
console.log("My first NodeJS application");
```
The `console.log()` function prints the string of text in quotes to the screen. To run the application, we can use the following command: 

> node index.js 

![](/learn_src/learn_assets/1_setup.png)
*Initial Setup*

Congratulations, you have now successfully run your first NodeJS application!

## @solana/web3.js

Solana nodes accept HTTP requests using the [JSON-RPC](https://www.jsonrpc.org) 2.0 specification.
To interact with a Solana node inside a Javascript application, we use the `solana-web3.js` library which is provided by the npm package `@solana/web3.js`. 

To install this package, execute the following command in your `roulette` directory:

> npm install @solana/web3.js 

When that command has completed you'll find a `node_modules` folder will have been created.  This directory contains all files related to the `@solana/web3.js` package.

Now, lets declare a variable for the installed package.  Replace the `console.log` line with this:
```javascript
const web3 = require("@solana/web3.js");
```

NOTE:
- To install all the packages listed in `package.json` file, use the command `npm install`. 
- This quest was written with `@solana/web3.js` version `v.1.30.2`. If you find some functions are not working when progressing through the quest, roll back to version `v.1.30.2` by changing the version number of `@solana/web3.js` in `package.json`.

## Establishing A Connection
Now that we have imported the Solana library we need to establish a connection to the network using the `Connection` method. For this quest, we will be connected to the `devnet`. The connection constructor takes a string representation of the endpoint URL and commitment level. The endpoint URL can be specified using the `clusterApiUrl()` function which will return the current live endpoint to the Solana network we provide.

The code for connection looks like this, which you will add after `const web3`:

```javascript
const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
// Ensure the connection was successfully made
console.log(connection._rpcEndpoint);
```

Again, run that with: 

> node index.js

You should see it print `https://api.devnet.solana.com` which confirms that we are connected to `devnet`.

## Generating a Wallat

The winning prize for the player is airdropped here (you can also use a wallet with good amount of SOL) but the player must have a wallet from which they will be paying SOL or receiving their winnings. We can generate a new wallet pair using the `Keypair` method. Replace the previous `console.log` with the following:

```javascript
const userWallet = web3.Keypair.generate();
console.log(userWallet);
```
That will print the Public Key and the Secret Key for the generated wallet in formatted as a raw Uint8 array. 

![](/learn_src/learn_assets/2_wallet_generation.png)
*Wallet Generation*

Copy the arrays and store them in `userPublicKey` and `userSecretKey` constants (also remove the previous `console.log` statement). For example:

```javascript
const userPublicKey = [
    112,  11, 232, 192, 104, 68, 202,
    109, 232, 158, 177, 209, 40, 215,
     96,  68, 101, 211, 139, 76, 100,
    185, 255, 107, 190, 205, 45, 198,
    123,  28, 200, 214
];
const userSecretKey = [
    202,   2, 192,  24, 184, 162,   1, 183, 254, 141, 171, 
      0, 155,  68,  40, 160, 195, 245, 215, 247, 226, 189, 
     40, 123, 158,  61, 195, 20,   58, 203,  48, 114, 112, 
     11, 232, 192, 104,  68, 202, 189, 232, 158, 177, 209, 
     40, 215,  96,  68, 101, 211, 139,  76, 100, 185, 255, 
    107, 190, 205,  45, 198, 123,  28, 200, 214
];
```

NOTE:
Make sure you use the values displayed after you ran `node index.js` so that you know you are using your own wallet. 

Now we can generate a wallet instance from the secret key:

```javascript
const userWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
```

You should airdrop some SOL into this wallet using the functions from [the previous quest](https://openquest.xyz/quest/create-an-airdrop-program-with-solana-web3.js) so that you have playing money.
We have now successfully established a connection and have wallets and funds in the wallet for the game. 

## Transaction Overview
For making a successful transaction we will need the following:
- The public key of the "from" wallet
- The public key of the "to" wallet
- The amount of SOL to be transferred 
- An instance of the "from" wallet for the signer

Initially, the participation amount will be from the user wallet and transferred to a treasury wallet, whose secret key and wallet instance are already available. Thus, we can now execute a transaction. To do so we will first create a new transaction object. Then, we will send that transaction to another user and add our signature to it.

## Creating A Transaction
We can start with creating a empty Transaction object and then add instructions to it. The `SystemProgram.transfer()` method is responsible for sending the funds from one account to another which takes the following arguments:

- `fromPubkey`: the public key of the account that we are sending funds from
- `toPubkey`: the public key of the account that we are sending funds to
- `lamports`: the amount of [lamports](https://docs.solana.com/introduction#what-are-sols) to be sent. ( `1 SOL = 1000000000 lamports`)
  
The transaction variable will look like this:

```javascript
const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
        fromPubkey: new web3.PublicKey(from.publicKey.toString()),
        toPubkey: new web3.PublicKey(to.publicKey.toString()),
        lamports: web3.LAMPORTS_PER_SOL
    })
);
```

## Signing the Transaction
Now we need to authorize the transaction by signing it with our secret key. The signature notifies on-chain programs that the account holder has authorized the transaction. 

That means we will need to create a signature constant, which will store the result from the `sendAndConfirmTransaction()` function.  This function accepts the following arguments: 
- `connection`: the connection instance 
- `transaction`: the transaction constant that was created earlier in this quest
- `[signers]`: the wallet instance of all the signers for the transaction

NOTE: There is also an optional parameter called "commitment option".  If it is not specified then the max commitment option will be used. 

The signature variable will look like this:

```javascript
const signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction,
    [fromWalletInstance]
);
```

Putting all of these together we create a function called `transferSOL`. Our `index.js` file should now look something like this:

```javascript
const web3 = require('@solana/web3.js');
const userPublicKey = [
    112,  11, 232, 192, 104, 68, 202,
    109, 232, 158, 177, 209, 40, 215,
     96,  68, 101, 211, 139, 76, 100,
    185, 255, 107, 190, 205, 45, 198,
    123,  28, 200, 214
];
const userSecretKey = [
    202,   2, 192,  24, 184, 162,   1, 183, 254, 141, 171, 
      0, 155,  68,  40, 160, 195, 245, 215, 247, 226, 189, 
     40, 123, 158,  61, 195, 20,   58, 203,  48, 114, 112, 
     11, 232, 192, 104,  68, 202, 189, 232, 158, 177, 209, 
     40, 215,  96,  68, 101, 211, 139,  76, 100, 185, 255, 
    107, 190, 205,  45, 198, 123,  28, 200, 214
];
const transferSOL = async (from, to, transferAmt) => {
    try {
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: new web3.PublicKey(from.publicKey.toString()),
                toPubkey: new web3.PublicKey(to.publicKey.toString()),
                lamports: transferAmt * web3.LAMPORTS_PER_SOL
            })
        );
        const signature = await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        return signature;
    } catch(err) {
        console.error(err);
    }
}
```

Here, the parameters for the function is: 
- `from` refers to the "from" wallet instance
- `to` refers to the "to" wallet instance
- `transferAmt` refers to the amount in SOL to be transferred during the transaction. 

## Getting Wallet Balance

The wallet balance can be also found from the public key of the wallet using the `Connection` object. First, we establish the connection and store it in a connection variable. Then, we use the function `getBalance()` and pass in the public key. We get the balance in Lamports (fractions of a SOL). To get the balance in SOL, we divide the balance by `LAMPORTS_PER_SOL`. The resultant function, which we will add after `transferSOL`, will be:

```javascript
const getWalletBalance = async (pubk) => {
    try {
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
        const balance = await connection.getBalance(new web3.PublicKey(pubk));
        return balance / web3.LAMPORTS_PER_SOL;
    } catch(err) {
        console.error(err);
    }
}
```

## Project Structure

So far we have left all of our code in `index.js`.  However, in order to keep everything organized and maintainable, we need to move some of the code into other files.  


### Solana Functions
The first thing we need to do is create a file called `solana.js` and move the `getWalletBalance()` and `transferSOL()` as well as the `require` statement into that file.  The purpose of this file is to contain code that interacts with Solana.

```javascript
const web3 = require('@solana/web3.js');

const getWalletBalance = async (pubk) => {
    try {
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
        const balance = await connection.getBalance(new web3.PublicKey(pubk));
        return balance / web3.LAMPORTS_PER_SOL;
    } catch (err) {
        console.error(err);
    }
}

const transferSOL = async (from, to, transferAmt) => {
    try {
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: new web3.PublicKey(from.publicKey.toString()),
                toPubkey: new web3.PublicKey(to.publicKey.toString()),
                lamports: transferAmt * web3.LAMPORTS_PER_SOL
            })
        );
        const signature = await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        return signature;
    } catch(err) {
        console.error(err);
    }
}
```

Now we need to add a function to provide the ability to airdrop Lamports on to the wallet (works only on the devnet):

```javascript
const airDropSol = async (wallet, transferAmt) => {
    try {
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
        const fromAirDropSignature = await connection.requestAirdrop(new web3.PublicKey(wallet.publicKey.toString()), transferAmt * web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(fromAirDropSignature);
    } catch(err) {
        console.error(err);
    }
}
```

We need to make those functions available to any other code that will `require` them:

```javascript
module.exports = {
    getWalletBalance,
    transferSOL,
    airDropSol
}
```

### Helper Functions
Now we need a file that contains some helper functions so we'll call it `helper.js`:

```javascript
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function totalAmtToBePaid(investment){
    //If we want to keep 5% as the participation fee, then the following will be the totalAmtToBePaid 
    //return investment + 0.05 * investment;
    return investment;
}

function getReturnAmount(investment, stakeFactor){
    return investment * stakeFactor;
}
  
module.exports = {
    randomNumber,
    totalAmtToBePaid,
    getReturnAmount
}
```

- `randomNumber()`, as its name implies, generates a random number between a defined range.
- `totalAmtToBePaid()` returns the total amount to be paid by the player for each game.  Currently it pays out the whole amount but, as you can see from the comment, we can easily take a 5% participation fee if we want.
- `getReturnAmount()` returns the total amount the player will get if their guess is correct.

### Additional Node Modules
The last thing we need to do is add some useful Node packages that will help us build our game.

Open `package.json` and change the `dependencies` section to look like this:

```json
"dependencies": {
    "@solana/web3.js": "^1.30.2",
    "chalk": "^4.1.2",
    "figlet": "^1.5.2",
    "inquirer": "^8.2.0",
    "yargs-parser": "^21.0.0"
}
```

- [`chalk`](https://www.npmjs.com/package/chalk) is a handy package that helps us make output more visually appealing by displaying colors, bold/italics/underlined text, etc...
- [`figlet`](https://www.npmjs.com/package/figlet) makes it easy to create ASCII art.
- [`inquirer`](https://www.npmjs.com/package/inquirer) provides a set of functions that will help us build our command-line interface.
- [`yargs-parser`](https://www.npmjs.com/package/yargs-parser) helps us parse command line options.

NOTE: With the exception of chalk, you may want to update the version numbers to match the latest versions of those packages.

To install those packages simply run: 

>npm install

## Building The Game

Let's return back to `index.js`. The only code that should be there now are the variables that contain the public and private keys.

The first thing to do is `require` everything we need.  Place that above the variables we added earlier:

```javascript
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const web3 = require('@solana/web3.js');

const { getWalletBalance, transferSOL, airDropSol } = require('./solana');
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');

// NOTE! Remember to change the values of these keys!
const userPublicKey = [
    112,  11, 232, 192, 104, 68, 202,
    109, 232, 158, 177, 209, 40, 215,
     96,  68, 101, 211, 139, 76, 100,
    185, 255, 107, 190, 205, 45, 198,
    123,  28, 200, 214
];
const userSecretKey = [
    202,   2, 192,  24, 184, 162,   1, 183, 254, 141, 171, 
      0, 155,  68,  40, 160, 195, 245, 215, 247, 226, 189, 
     40, 123, 158,  61, 195, 20,   58, 203,  48, 114, 112, 
     11, 232, 192, 104,  68, 202, 189, 232, 158, 177, 209, 
     40, 215,  96,  68, 101, 211, 139,  76, 100, 185, 255, 
    107, 190, 205,  45, 198, 123,  28, 200, 214
];
```

Now add your wallets after your keys:

```javascript
const userWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
const treasuryWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
```

Next, let's create a function that kicks things off by displaying an ASCII art title and a note about how much SOL may be bid:

```javascript
const init = () => {
    console.log(
        chalk.green(
            figlet.textSync('SOL Stake', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );
    console.log(chalk.yellow`The max bidding amount is 2.5 SOL here`);
};
```

Then define a function to ask the questions needed as part of the gameplay:

```javascript
const askQuestions = () => {
    const questions = [
        {
            name: "SOL",
            type: "number",
            message: "What is the amount of SOL you want to stake?",
        },
        {
            type: "rawlist",
            name: "RATIO",
            message: "What is the ratio of your staking?",
            choices: ["1:1.25", "1:1.5", "1.75", "1:2"],
            filter: function (val) {
                const stakeFactor = val.split(":")[1];
                return stakeFactor;
            },
        },
        {
            type: "number",
            name: "RANDOM",
            message: "Guess a random number from 1 to 5 (both 1, 5 included)",
            when: async (val) => {
                if(parseFloat(totalAmtToBePaid(val.SOL)) > 5){
                    console.log(chalk.red`You have violated the max stake limit. Stake with a smaller amount.`);
                    return false;
                } else {
                    console.log(`You need to pay ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to move forward.`);
                    const userBalance = await getWalletBalance(userWallet.publicKey.toString());

                    if(userBalance < totalAmtToBePaid(val.SOL)) {
                        console.log(chalk.red`You don't have enough balance in your wallet`);
                        return false;
                    } else {
                        console.log(chalk.green`You will get ${getReturnAmount(val.SOL, parseFloat(val.RATIO))} if guessing the number correctly`);
                        return true;    
                    }
                }
            },
        }
    ];

    return inquirer.prompt(questions);
};
```

## Game Execution

The game will proceed through the following steps:
1. Ask for Ratio
2. Ask for Sol to be Staked
3. Check the amount to be available in Wallet 
4. Ask Public Key
5. Generate a Random Number
6. Ask for the generated Number 
7. If true return the SOL as per ratio

The last thing we to do is to define a function that actually executes the game. Then we need to call it which starts the game:

```javascript
const gameExecution = async () => {
    init();
    const generateRandomNumber = randomNumber(1, 5);
    const answers = await askQuestions();

    if (answers.RANDOM) {
        const paymentSignature = await transferSOL(userWallet, treasuryWallet, totalAmtToBePaid(answers.SOL));
        console.log(`Signature of payment for playing the game`, chalk.green`${paymentSignature}`);

        if (answers.RANDOM === generateRandomNumber) {
            // AirDrop the winning amount
            await airDropSol(treasuryWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)));

            // The guess was successful
            const prizeSignature = await transferSOL(treasuryWallet, userWallet, getReturnAmount(answers.SOL, parseFloat(answers.RATIO)));

            console.log(chalk.green`Your guess is absolutely correct`);
            console.log(`Here is the price signature `, chalk.green`${prizeSignature}`);
        } else {
            // Better luck next time
            console.log(chalk.yellowBright`Better luck next time!`);
        }
    }
}

gameExecution();
```

## Running The Application

To play the game, return to the terminal and run: 

> node index.js

You will see it ask questions and then you can guess the number.

![](/learn_src/learn_assets/3_failed_game.png)
*Losing Game*

![](/learn_src/learn_assets/4_successful_game.png)
*Winning Game*

## Troubleshooting

### Insufficient Funds
If you play the game with a brand new wallet then you will likely see this error:

```
You don't have enough balance in your wallet
```

If you encounter such an error then you'll need to add funds to your wallet.  [Refer to the previous quest for instructions on how to do that.](https://openquest.xyz/quest/create-an-airdrop-program-with-solana-web3.js)

### ESM Errors

You may see an error that looks something like this:

```
roulette/index.js:2
const chalk = require('chalk');
              ^

Error [ERR_REQUIRE_ESM]: require() of ES Module roulette/node_modules/chalk/source/index.js from roulette/index.js not supported.
```

If you encounter that error then you likely used the latest version of the `chalk` package which, as of version 5, is now a [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).  The best thing to do is to downgrade it back to version 4.  Once you've done that, delete the `node_modules` directory and re-run:

> node install

## Conclusion

Congratulations, you have now learned how to perform a transaction on the Solana network! 

**Be sure to proceed to [Layer3](https://alpha.layer3.xyz/task/create-a-roulette-game-in-solana) and claim your NFT reward for succesfully completing this quest!**
