const { Client } = require('pg');
const regions = ['ap-south-1', 'ap-southeast-1', 'us-east-1', 'eu-west-1', 'us-west-1', 'eu-central-1', 'ap-northeast-1'];
async function test() {
  for (const r of regions) {
    const url = `postgresql://postgres.cxmlerkxwxfqenexvtim:FairRide2026!@aws-0-${r}.pooler.supabase.com:6543/postgres`;
    console.log('Testing', url);
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log('SUCCESS:', url);
      await client.end();
      return;
    } catch (e) {
      console.log('FAIL:', e.message);
    }
  }
}
test();
