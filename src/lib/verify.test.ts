import assert from "node:assert/strict";
import { test } from "node:test";
import { isOfficialUrl } from "./official";
import { matchPlace, parseReport } from "./parse";
import { amountOnPage, quoteOnPage, timeOnPage } from "./verify";

test("amounts are matched as whole tokens, in common formats", () => {
  assert.equal(amountOnPage(195, "The Food Shop Licence costs $195 and is valid for 1 year."), true);
  assert.equal(amountOnPage(195, "Call 6195 1950 for help"), false);
  assert.equal(amountOnPage(1300, "Fee: £1,300.00 per application"), true);
  assert.equal(amountOnPage(15, "It costs S$15 to register a name"), true);
  assert.equal(amountOnPage(15, "Read section 15 of the Act"), false);
  assert.equal(amountOnPage(0, "Registration of your food business is free and can't be refused."), true);
  assert.equal(amountOnPage(50, "pay £50.50 online"), false);
});

test("times need the number next to a unit", () => {
  assert.equal(timeOnPage("at least 28 days before trading", "You should do this at least 28 days before you start trading."), true);
  assert.equal(timeOnPage("28 days", "There are 28 councils."), false);
  assert.equal(timeOnPage("4 to 6 weeks", "Processing takes 4 to 6 weeks."), true);
  assert.equal(timeOnPage("immediately", "anything"), null);
});

test("quotes survive markdown and curly quotes", () => {
  const page = "When you start a **new food business**, you must register with your local authority. Registration is free and can’t be refused.";
  assert.equal(quoteOnPage("you must register with your local authority. Registration is free and can't be refused", page), true);
  assert.equal(quoteOnPage("you must pay a fee of two hundred pounds to the council every year", page), false);
});

test("official domains", () => {
  for (const u of ["https://www.gov.uk/x", "https://www.sfa.gov.sg/a", "https://www.nyc.gov/a", "https://www.casa.gov.au/", "https://entreprendre.service-public.fr/x", "https://www.caa.co.uk/drones", "https://www.meti.go.jp/"])
    assert.equal(isOfficialUrl(u), true, u);
  for (const u of ["https://www.legalzoom.com/x", "https://governmentjobs.com", "https://gov.uk.example.com/x", "not a url"]) assert.equal(isOfficialUrl(u), false, u);
});

test("report parsing keeps only asked-for places and never invents rows", () => {
  const report = `# Report\n\nProse here.\n\n## DATA\n\n\`\`\`json\n{"places":[{"place":"London","requirements":[{"category":"activity_licence","name":"Food business registration","authority":"Local council","status":"mandatory","fee":{"amount":0,"currency":"GBP","basis":"one-off","text":"free"},"processing_time":{"min_days":28,"max_days":28,"text":"28 days"},"renewal":{"period":null,"fee_text":null},"source_url":"https://www.gov.uk/food-business-registration","source_quote":null,"gaps":null,},{"category":"nonsense","name":"x"}]},{"place":"Paris","requirements":[]}],"recommendation":{"easiest":"London","ranking":["London"],"reasons":["r"],"trade_offs":[]}}\n\`\`\`\n`;
  const parsed = parseReport(report, ["London, England, United Kingdom", "Singapore", "New York City"]);
  assert.equal(parsed.places[0].requirements.length, 1);
  assert.equal(parsed.places[1].requirements.length, 0);
  assert.equal(parsed.recommendation?.easiest, "London, England, United Kingdom");
  assert.equal(parsed.warnings.length, 2);
  assert.equal(parsed.prose.includes("DATA"), false);
  assert.equal(matchPlace("NYC", ["New York City", "London", "Singapore"]), null);
});
