/** @type {import('next').NextConfig} */

// Supabase storage hosts that next/image may load from.
//
// Both projects are listed while production moves between them: the code and
// the env vars deploy separately, so for a while the site may be reading rows
// from either project. Allowing both means neither deploy order breaks images.
// Remove the old host once the old project has been deleted.
const supabaseStorageHosts = [
  'zhmneuwvbajsbtllchfg.supabase.co', // current project
  'ebzhjarzdakbirveucyy.supabase.co', // old project — remove after it is deleted
];

const nextConfig = {
  images: {
    remotePatterns: supabaseStorageHosts.map((hostname) => ({
      protocol: 'https',
      hostname,
      pathname: '/storage/v1/object/public/**',
    })),
  },
};

export default nextConfig;
