const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const { Keypair } = require('@solana/web3.js');

const {getWalletBalance,transferSOL,airDropSol}=require("./solana");
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');

const init = () => {
    console.log(
        chalk.green(
        figlet.textSync("SOL Stake", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default"
        })
        )
    );
    console.log(chalk.yellow`The max bidding amount is 2.5 SOL here`);
};


//Ask for Ratio
//Ask for Sol to be Staked
//Check the amount to be available in Wallet 
//Ask Public Key
//Generate a Random Number
//Ask for the generated Number 
//If true return the SOL as per ratio

// const userWallet=web3.Keypair.generate();

// const userPublicKey=[
//     6,  85, 188,  71, 255,  12, 214, 102,
//    84, 170, 129, 127,  64,  57, 133,  22,
//    10,   9, 135,  34,  75, 223, 107, 252,
//   253,  22, 242, 135, 180, 245, 221, 155
// ]
const userSecretKey=[
    229,  65,  12, 110, 128, 101,  62, 119, 239,  95,  26,
     67, 178,  99,  40,  77,  46, 151, 163, 227, 167,   5,
    138, 101, 140, 195, 212, 161, 105, 216,  79,  73,   6,
     85, 188,  71, 255,  12, 214, 102,  84, 170, 129, 127,
     64,  57, 133,  22,  10,   9, 135,  34,  75, 223, 107,
    252, 253,  22, 242, 135, 180, 245, 221, 155
]

const userWallet=Keypair.fromSecretKey(Uint8Array.from(userSecretKey));


//Treasury
const secretKey=[
    111, 188,  76, 169,  30, 105, 254,  33, 228,  66,  56,
    215,   9,  37,  51, 188, 188, 188,  20, 224, 228, 115,
     17, 163, 151, 105, 113, 251, 105, 177,  28, 157, 125,
    202, 195, 203, 253, 137,  26, 209,   7,   2,  66, 193,
     76, 241, 203, 168, 213,   5, 226,  11, 142,  44, 125,
    191, 167, 172, 166, 207, 176, 137, 210,  27
]

const treasuryWallet=Keypair.fromSecretKey(Uint8Array.from(secretKey));


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
            filter: function(val) {
                const stakeFactor=val.split(":")[1];
                return stakeFactor;
            },
        },
        {
            type:"number",
            name:"RANDOM",
            message:"Guess a random number from 1 to 5 (both 1, 5 included)",
            when:async (val)=>{
                if(parseFloat(totalAmtToBePaid(val.SOL))>5){
                    console.log(chalk.red`You have violated the max stake limit. Stake with smaller amount.`)
                    return false;
                }else{
                    // console.log("In when")
                    console.log(`You need to pay ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to move forward`)
                    const userBalance=await getWalletBalance(userWallet.publicKey.toString())
                    if(userBalance<totalAmtToBePaid(val.SOL)){
                        console.log(chalk.red`You don't have enough balance in your wallet`);
                        return false;
                    }else{
                        console.log(chalk.green`You will get ${getReturnAmount(val.SOL,parseFloat(val.RATIO))} if guessing the number correctly`)
                        return true;    
                    }
                }
            },
        }
    ];
    return inquirer.prompt(questions);
};


const gameExecution=async ()=>{
    init();
    const generateRandomNumber=randomNumber(1,5);
    // console.log("Generated number",generateRandomNumber);
    const answers=await askQuestions();
    if(answers.RANDOM){
        const paymentSignature=await transferSOL(userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL))
        console.log(`Signature of payment for playing the game`,chalk.green`${paymentSignature}`);
        if(answers.RANDOM===generateRandomNumber){
            //AirDrop Winning Amount
            await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));
            //guess is successfull
            const prizeSignature=await transferSOL(treasuryWallet,userWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)))
            console.log(chalk.green`Your guess is absolutely correct`);
            console.log(`Here is the price signature `,chalk.green`${prizeSignature}`);
        }else{
            //better luck next time
            console.log(chalk.yellowBright`Better luck next time`)
        }
    }
}

gameExecution()
