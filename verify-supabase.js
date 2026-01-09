
import { createClient } from '@supabase/supabase-js';

// Read env vars (assuming they are set in process.env when running this script)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
    console.log('Usage: source .env && node verify-supabase.js');
    console.log('Or: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node verify-supabase.js');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log(`\x1b[36m%s\x1b[0m`, '\n🔍 Testing Supabase Connection...');
    console.log(`URL: ${supabaseUrl}`);

    try {
        // 1. Check basic connection/auth by querying a system table or a public table
        // Fetch user session (might be null if anon, but checks connection)
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError) {
            throw new Error(`Auth Error: ${authError.message}`);
        }
        console.log('✅ Auth Service Reachable');

        // 2. Check Database Access (try to select from 'partes' table, limit 1)
        console.log('Checking "partes" table access...');
        const { data, error: dbError } = await supabase
            .from('partes')
            .select('count', { count: 'exact', head: true });

        if (dbError) {
            // If table doesn't exist, it will throw specific error
            throw new Error(`Database Error: ${dbError.message} (Hint: details: ${dbError.details}, hint: ${dbError.hint})`);
        }

        console.log('✅ Database Connection Successful');
        console.log(`   Count query on 'partes' executed successfully.`);
        console.log(`\x1b[32m%s\x1b[0m`, '\n🎉 Supabase is correctly configured and accessible!\n');

    } catch (err: any) {
        console.error(`\x1b[31m%s\x1b[0m`, '\n❌ Connection Failed:');
        console.error(err.message);
        process.exit(1);
    }
}

checkConnection();
