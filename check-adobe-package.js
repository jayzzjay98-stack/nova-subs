import { createClient } from '@supabase/supabase-js';

// Read Supabase config from environment or client file
const supabaseUrl = 'https://ioovypkgkwdvyifeughu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvb3Z5cGtna3dkdnlpZmV1Z2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2OTY3MjksImV4cCI6MjA0ODI3MjcyOX0.CuDl3DP7bIgXQkkqQ0XLlIhQzPdW-hLyYPpN5XT5NVE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdobePackage() {
    try {
        // Fetch all packages
        const { data: packages, error } = await supabase
            .from('packages')
            .select('*')
            .ilike('name', '%adobe%');

        if (error) {
            console.error('Error fetching packages:', error);
            return;
        }

        console.log('Adobe packages found:');
        packages.forEach(pkg => {
            console.log(`\nPackage: ${pkg.name}`);
            console.log(`ID: ${pkg.id}`);
            console.log(`Duration Days: ${pkg.duration_days}`);
            console.log(`Price: ${pkg.price}`);
        });

        // Check if any Adobe package has incorrect duration_days
        const incorrectPackage = packages.find(pkg =>
            pkg.name.toLowerCase().includes('week') && pkg.duration_days !== 7
        );

        if (incorrectPackage) {
            console.log('\n⚠️  Found Adobe package with incorrect duration_days!');
            console.log(`Expected: 7 days, but got: ${incorrectPackage.duration_days} days`);

            // Update to correct value
            console.log('\nUpdating package to 7 days...');
            const { data: updated, error: updateError } = await supabase
                .from('packages')
                .update({ duration_days: 7 })
                .eq('id', incorrectPackage.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating package:', updateError);
            } else {
                console.log('✅ Package updated successfully!');
                console.log(`New duration_days: ${updated.duration_days}`);
            }
        } else {
            console.log('\n✅ All Adobe packages have correct duration_days');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

checkAdobePackage();
