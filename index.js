const Discord = require('discord.js');
const token1 = require('./.gitignore/token.js');
const client = new Discord.Client();
const token = token1.token;
const fs = require("fs");
const randomWords = require('random-words');
const score = require('./score.json');
const fetch = require('node-fetch');
const tord = require('./TruthOrDare.json');
const {
    isAbsolute
} = require('path');

client.on("ready", async () => {
    client.user.setActivity(":)");

});

function truthOrDare(args, message) {
    let random = between(0, tord.length);
    if (args[0].toLowerCase() === "truth") {
        while (tord[random].type != "Truth") {
            random = between(0, tord.length);
        }
        message.channel.send(tord[random].summary);
    }if (args[0].toLowerCase() === "dare") {
        while (tord[random].type != "Dare") {
            random = between(0, tord.length);
        }
        message.channel.send(tord[random].summary);
    }
}




function quizManager(args, message) {

    //0 : random, 1 : true/false, 2: multiple
    if (args[0].toLowerCase() === 'start-quiz' && args[1] == null) {
        let isRandom = 0;
        startQuiz(args, message, isRandom);
    }
    if (args[0].toLowerCase() === 'start-quiz' && args[1] != null) {
        if (args[1].toLowerCase() === 'tf') {
            let isRandom = 1;
            startQuiz(args, message, isRandom);
        }
    }
    if (args[0].toLowerCase() === 'start-quiz' && args[1] != null) {
        if (args[1].toLowerCase() === 'multiple') {
            let isRandom = 2;
            startQuiz(args, message, isRandom);
        }
    }
}

function booleanStartUpQuiz(xhr) {
    xhr.open("GET", "https://opentdb.com/api.php?amount=1&type=boolean", false); // false for synchronous request
    xhr.send(null);
    let myArr = JSON.parse(xhr.responseText).results[0];
    while (myArr.question.includes('&')) {
        XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        xhr = new XMLHttpRequest();
        xhr.open("GET", "https://opentdb.com/api.php?amount=1&type=boolean", false); // false for synchronous request
        xhr.send(null);
        myArr = JSON.parse(xhr.responseText).results[0];
    }
    return myArr;
}

function multipleStartUpQuiz(xhr) {
    xhr.open("GET", "https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple", false); // false for synchronous request
    xhr.send(null);
    let myArr = JSON.parse(xhr.responseText).results[0];
    while (myArr.question.includes('&') || myArr.incorrect_answers[0].includes('&') || myArr.incorrect_answers[1].includes('&') || myArr.incorrect_answers[2].includes('&') || myArr.correct_answer.includes('&')) {
        console.log("in while loop")
        XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        xhr = new XMLHttpRequest();
        xhr.open("GET", "https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple", false); // false for synchronous request
        xhr.send(null);
        myArr = JSON.parse(xhr.responseText).results[0];
    }
    console.log(myArr);
    return myArr;
}

function startQuiz(args, message, isRandom) {
    let decideQuiz = 3;

    if (isRandom == 0) {
        decideQuiz = between(0, 2);
    }
    if (isRandom == 1) {
        decideQuiz = 0;
    }
    if (isRandom == 2) {
        decideQuiz = 1;
    }

    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let xhr = new XMLHttpRequest();

    let myArr;
    let isCorrect = false;
    let isStop = false;

    if (decideQuiz == 0) {
        const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
            time: 20000
        });
        myArr = booleanStartUpQuiz(xhr);
        message.channel.send(`Question: **${myArr.question}**`);
        collector.on('collect', message1 => {
            let content = message1.content.substr(1, message1.content.length);
            if (myArr.correct_answer.toLowerCase().toLowerCase().startsWith(content.toLowerCase())) {
                correct++;
                message.channel.send("Correct");
                isCorrect = true;
                collector.stop();
            } else if (content.toLowerCase() === 'stop') {
                isStop = true;
                collector.stop();
            } else if (myArr.incorrect_answers[0].toLowerCase().startsWith(content.toLowerCase())) {
                message.channel.send("Incorrect");
                collector.stop();
            }
        })
        collector.on('end', async collected => {
            if (isStop) {
                message.channel.send("Stopping");
                message.channel.send(`Correct: ${correct} \nMissed: ${missed}`);
                correct = 0;
                missed = 0;
            } else if (!isCorrect) {
                message.channel.send(`Missed: answer was **${myArr.correct_answer.toLowerCase()}**`)
                missed++;
                if (missed > 4) {
                    message.channel.send("Too many misses, stopping");
                    message.channel.send(`Correct: ${correct} \nMissed: ${missed}`)
                    correct = 0;
                    missed = 0;
                } else {
                    const sleep = ms => new Promise(res => setTimeout(res, ms));

                    (async () => {
                        await sleep(500);
                        await sleep(1500);
                        startQuiz(args, message, isRandom);
                    })();

                }
            } else if (isCorrect) {
                isCorrect = false;
                const sleep = ms => new Promise(res => setTimeout(res, ms));

                (async () => {
                    await sleep(500);
                    await sleep(1500);
                    startQuiz(args, message, isRandom);
                })();

            }
        });
    } else if (decideQuiz == 1) {
        const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
            time: 40000
        });
        myArr = multipleStartUpQuiz(xhr);
        let randomIndex = between(1, 4);
        let question = [];
        question = myArr.incorrect_answers;
        question.splice(randomIndex, 0, myArr.correct_answer);
        message.channel.send(`Question: **${myArr.question}**\n1: ${question[0]}\n2: ${question[1]}\n3: ${question[2]}\n4: ${question[3]}`);

        collector.on('collect', message1 => {
            let content = message1.content.substr(1, message1.content.length);
            if (parseInt(content.toLowerCase()) === parseInt(question.indexOf(myArr.correct_answer)) + 1) {
                correct++;
                message.channel.send("Correct");
                isCorrect = true;
                collector.stop();
            } else if (content.toLowerCase() === 'stop') {
                isStop = true;
                collector.stop();
            } else {
                message.channel.send("Incorrect");
                collector.stop();
            }
        })
        collector.on('end', async collected => {
            if (isStop) {
                message.channel.send("Stopping");
                message.channel.send(`Correct: ${correct} \nMissed: ${missed}`);
                correct = 0;
                missed = 0;
            } else if (!isCorrect) {
                message.channel.send(`Missed: answer was **${myArr.correct_answer}**`)
                missed++;
                if (missed > 4) {
                    message.channel.send("Too many misses, stopping");
                    message.channel.send(`Correct: ${correct} \nMissed: ${missed}`)
                    correct = 0;
                    missed = 0;
                } else {
                    const sleep = ms => new Promise(res => setTimeout(res, ms));

                    (async () => {
                        await sleep(500);
                        await sleep(1500);
                        startQuiz(args, message, isRandom);
                    })();

                }
            } else if (isCorrect) {
                isCorrect = false;
                const sleep = ms => new Promise(res => setTimeout(res, ms));

                (async () => {
                    await sleep(500);
                    await sleep(1500);
                    startQuiz(args, message, isRandom);
                })();

            }
        });
    }




}



function returnPages(pages, newArgs, message, footer) {

    let page = 1;
    const embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle(`${newArgs}`)
        .setFooter(`Page ${page} of ${pages.length} ` + footer)
        .setDescription(pages[page - 1]);

    message.channel.send(embed).then(msg => {

        msg.react('◀️').then(r => {
            msg.react('▶️')
            const backwardsFilter = (reaction, user) => reaction.emoji.name === '◀️' && user.id === message.author.id;
            const forwardsFilter = (reaction, user) => reaction.emoji.name === '▶️' && user.id === message.author.id;
            const backwards = msg.createReactionCollector(backwardsFilter, {
                time: 60000
            });
            const forwards = msg.createReactionCollector(forwardsFilter, {
                time: 60000
            });
            backwards.on('collect', r => {
                if (page === 1) return;
                page--;
                embed.setDescription(pages[page - 1]);
                embed.setFooter(`Page ${page} of ${pages.length} ` + footer);
                msg.edit(embed);
            })
            forwards.on('collect', r => {
                if (page === pages.length) return;
                page++;
                embed.setDescription(pages[page - 1]);
                embed.setFooter(`Page ${page} of ${pages.length} ` + footer);
                msg.edit(embed);
            })
        })
    })
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

let correct = 0;
let missed = 0;

function scrambler(args, message) {
    if (args[1] != null) {
        if (args[0] === 'scramble' && args[1] === 'alone') {
            scrambleWordAlone(args, message);
        }
    } else {
        if (args[0] === 'scramble') {
            scrambleWord(args, message)
        }
    }
}

function addScore(author, correct) {
    let isExist = false;
    score.forEach(val => {
        if (val.author === author) {
            isExist = true;
            if (correct > val.correct) {
                val.correct = correct;
                fs.writeFileSync("./score.json", JSON.stringify(score, null, 2), (err) => {
                    if (err) console.log(err);
                });
            }
        }
    })
    if (!isExist) {
        score.push({
            author: author,
            correct: correct,
        });
        fs.writeFile("./score.json", JSON.stringify(score, null, 2), (err) => {
            if (err) console.log(err);
        });
    }
}

function displayScore(args, message) {
    if (args[0] === 'scores') {
        let displayingArray = [];
        score.forEach(function (val, i) {
            displayingArray[i] = [val.author, val.correct]
        })
        let sortedArray = displayingArray.sort(function (a, b) {
            return b[1] - a[1];
        });
        let newList = "";
        let arrayOfPlayers = [];
        //Making it so that each index has 10 lines
        for (let index = 0; index < sortedArray.length; index++) {
            newList += `${index+1}. ${sortedArray[index][0]}: ${sortedArray[index][1]}\n`;
            if (index % 10 == 0 && index != 0) {
                arrayOfPlayers[(index - 10) / 10] = newList;
                newList = "";
            }
        }
        arrayOfPlayers[arrayOfPlayers.length] = newList;
        returnPages(arrayOfPlayers, "All Scores", message, "Scores");
    }
}

function help(args, message) {
    if (args[0].toLowerCase() === 'help-game') {
        let embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setDescription(`!scores : Shows high scores \n
            !scramble : anyone can participate, simply put "." before the guess, or type ".stop" to stop the game : game ends when the timer runs out on a word 5 times \n
            !scramble alone : only you may participate, and no prefix is needed, this one will go to the scores : game ends when the timer runs out on a word 5 times \n
            !start-quiz : starts a random true or false or multiple choice quiz, put "." infront your answer ex<.true> or <.1>\n
            !start-quiz tf : starts true or false \n
            !start-quiz multiple : starts a multiple choice question quiz`);
        message.channel.send(embed);
    }
}

function scrambleWord(args, message) {
    let word = "";
    while (word.length <= 2) {
        word = randomWords()
    }
    console.log(word);
    let stop = false;
    let isCorrect = false;
    let startingArrayOfCharacters = word.split('');
    let arrayOfCharacters = startingArrayOfCharacters;
    while (word === arrayOfCharacters.join('')) {
        for (let index = 0; index < arrayOfCharacters.length - 2; index++) {
            let randomCharacter = between(0, arrayOfCharacters.length - 1);
            let randomMover = between(0, arrayOfCharacters.length - 1);
            let temp = arrayOfCharacters[randomCharacter];
            arrayOfCharacters[randomCharacter] = arrayOfCharacters[randomMover];
            arrayOfCharacters[randomMover] = temp;
        }
    }
    let randomWordScrambled = arrayOfCharacters.join('');
    message.channel.send(`New word **${randomWordScrambled}**`);

    const collector = new Discord.MessageCollector(message.channel, m => m.content.includes('.'), {
        time: 20000
    });
    collector.on('collect', message1 => {
        message1.content = message1.content.substr(1, message1.content.length);
        if (message1.content.toLowerCase() === word) {
            message.channel.send("Correct");
            correct++;
            isCorrect = true;
            collector.stop()
        } else if (message1.content === 'stop') {
            stop = true;
            collector.stop()
        } else {
            message.channel.send("Incorrect");
        }
    })
    collector.on('end', collected => {
        if (stop) {
            message.channel.send("Stopping");
            message.channel.send(`Correct: ${correct} \nMissed: ${missed}`);
            correct = 0;
            missed = 0;
        } else if (!isCorrect) {
            message.channel.send(`Time ran out, correct word was: **${word}**`);
            missed++;
            if (missed > 4) {
                message.channel.send("Too many misses, stopping");
                message.channel.send(`Correct: ${correct} \nMissed: ${missed}`);
                correct = 0;
                missed = 0;
            } else {
                scrambleWord(args, message);
            }
        } else {
            scrambleWord(args, message);
        }
    });
}

function scrambleWordAlone(args, message) {
    let word = "";
    while (word.length <= 2) {
        word = randomWords()
    }
    console.log(word);
    let stop = false;
    let isCorrect = false;
    let startingArrayOfCharacters = word.split('');
    let arrayOfCharacters = startingArrayOfCharacters;
    while (word === arrayOfCharacters.join('')) {
        for (let index = 0; index < arrayOfCharacters.length - 2; index++) {
            let randomCharacter = between(0, arrayOfCharacters.length - 1);
            let randomMover = between(0, arrayOfCharacters.length - 1);
            let temp = arrayOfCharacters[randomCharacter];
            arrayOfCharacters[randomCharacter] = arrayOfCharacters[randomMover];
            arrayOfCharacters[randomMover] = temp;
        }
    }
    let randomWordScrambled = arrayOfCharacters.join('');
    message.channel.send(`New word **${randomWordScrambled}**`);
    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
        time: 10000
    });
    collector.on('collect', message1 => {
        if (message1.content.toLowerCase() === word) {
            message.channel.send("Correct");
            correct++;
            isCorrect = true;
            collector.stop()
        } else if (message1.content === 'stop') {
            stop = true;
            collector.stop()
        } else {
            message.channel.send("Incorrect");
        }
    })
    collector.on('end', message1 => {
        if (stop) {
            message.channel.send("Stopping");
            message.channel.send(`Correct: ${correct} \nMissed: ${missed}`)
            addScore(message.author.username, correct)
            correct = 0;
            missed = 0;
        } else if (!isCorrect) {
            message.channel.send(`Time ran out, correct word was: **${word}**`);
            missed++;
            if (missed > 4) {
                message.channel.send("Too many misses, stopping");
                message.channel.send(`Correct: ${correct} \nMissed: ${missed}`)
                addScore(message.author.username, correct)
                correct = 0;
                missed = 0;
            } else {
                scrambleWordAlone(args, message);

            }
        } else {
            scrambleWordAlone(args, message);
        }
    });
}
client.on("message", message => {
    const Prefix = "!";
    if (message.content.startsWith(Prefix)) {
        let args = message.content.substring(Prefix.length).split(" ");
        scrambler(args, message);
        quizManager(args, message);
        help(args, message);
        displayScore(args, message);
        truthOrDare(args, message);
    }
});


client.login(token);