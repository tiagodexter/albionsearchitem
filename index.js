const request = require("async-request");
const arg = require("minimist")(process.argv.slice(2));
const prompt = require("prompt-async");
const formatter = new Intl.NumberFormat();
const url = "https://www.albion-online-data.com/api/v2/stats/history";

const base = 9999999999999;
let json = "";
let city = "";

const search = async (item, location, quality) => {
	try {
		const response = await request(
			`${url}/${item}?locations=${location}&quilities=${quality}`
		);
		json = JSON.parse(response.body);
		// console.table(json);
	} catch (e) {
		console.log("Item not found");
		process.exit(1);
		return;
	}
	let min = base;
	for (e of json) {
		for (items of e.data) {
			if (items.avg_price < min) {
				min = items.avg_price;
				city = e.location;
			}
		}
	}
	if (min == base) {
		console.log("Item not found");
	} else {
		min = formatter.format(min);
		console.log(`Found on city ${city} with price ${min} silver coins`);
	}
};

const main = async () => {
	const city = arg.city || arg.c || "Linhust";
	const quality = arg.quality || arg.q;
	if (arg.item || arg.i) {
		const item = arg.item || arg.i;
		await search(item, city, quality);
	} else {
		const item = await list_cat();
		await search(item, city, quality);
		process.exit(1);
	}
};

const list_cat = async () => {
	const url =
		"https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.json";
	const response = await request(url);
	const json = JSON.parse(response.body);
	console.log("Select the category");
	let i = 1;
	let category = [];
	for (cat of Object.keys(json.items)) {
		if (typeof json.items[cat] === "object") {
			console.log(`${i}: ${cat}`);
			category[i] = json.items[cat];
			i++;
		}
	}
	prompt.start();
	const { choice } = await prompt.get(["choice"]);
	console.log(choice);
	const item = await list_item(category[choice]);
	return item;
};

const list_item = async (category) => {
	let i = 1;
	let names = [];
	for (item of category) {
		if (item["@uniquename"]) {
			console.log(`${i} ${item["@uniquename"]}`);
			names[i] = item["@uniquename"];
			i++;
		}
	}
	prompt.start();
	const { choice } = await prompt.get(["choice"]);
	return names[choice];
};

main();
