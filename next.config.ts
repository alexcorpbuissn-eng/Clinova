import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-doctor-id, x-user-role" },
        ]
      }
    ];
  },
  async rewrites() {
    return [
      { source: '/superadmin', destination: '/superadmin.html' },
      { source: '/admin', destination: '/admin.html' },
      { source: '/doctor', destination: '/doctor.html' },
      { source: '/reception', destination: '/reception.html' },
      { source: '/inventory', destination: '/inventory.html' },
      { source: '/login', destination: '/login.html' },
      { source: '/profile', destination: '/profile.html' },
      { source: '/my-appointments', destination: '/my-appointments.html' },
      { source: '/', destination: '/clinova.html' },
      { source: '/booking', destination: '/booking.html' },
      // ─── Clinic websites ───────────────────────────────────────────────────
      // Each clinic lives in: public/clinics/<clinic-id>/
      //   index.html, about.html, services.html
      // To add a new clinic, duplicate the three lines below for the new clinic-id.
      { source: '/habibullo-hilola', destination: '/clinics/habibullo-hilola/index.html' },
      { source: '/habibullo-hilola/about', destination: '/clinics/habibullo-hilola/about.html' },
      { source: '/habibullo-hilola/services', destination: '/clinics/habibullo-hilola/services.html' },
    ];
  }
};

export default nextConfig;
