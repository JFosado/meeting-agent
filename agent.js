const { startMeetingBot } = require("./meetingBot");

const urls = process.argv.slice(2);

if (urls.length === 0) {
  console.log("Uso: node agent.js <url1> <url2> ...");
  process.exit(1);
}

urls.forEach((url, index) => {
  const meetingId = `meeting${index + 1}`;

  startMeetingBot({
    url,
    meetingId
  });
});