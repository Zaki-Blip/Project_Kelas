import "dotenv/config";

import { randomBytes } from "node:crypto";

import { hash } from "@node-rs/argon2";
import {
  PklStatus,
  PrismaClient,
  ProjectStatus,
  Role,
} from "../src/generated/prisma/client";
import { createPrismaAdapter } from "../src/lib/prisma-adapter";

// @node-rs/argon2 defaults to Argon2id, which is the algorithm we want here.
const ARGON_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const prisma = new PrismaClient({
  adapter: createPrismaAdapter(databaseUrl),
});

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to run the seed.`);
  }
  return value;
}

async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON_OPTIONS);
}

const categories = [
  { name: "Aplikasi Web", slug: "web-app" },
  { name: "Permainan", slug: "game" },
  { name: "Data & AI", slug: "data-ai" },
  { name: "IoT", slug: "iot" },
  { name: "Web Seluler", slug: "mobile-web" },
];

const technologies = [
  { name: "Next.js", slug: "nextjs" },
  { name: "React", slug: "react" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Laravel", slug: "laravel" },
  { name: "PHP", slug: "php" },
  { name: "MySQL", slug: "mysql" },
  { name: "Tailwind CSS", slug: "tailwind-css" },
  { name: "Python", slug: "python" },
  { name: "Figma", slug: "figma" },
  { name: "Arduino", slug: "arduino" },
];

const demoUsers = [
  {
    key: "budi",
    fullName: "Budi Santoso",
    username: "budi",
    email: "budi@example.test",
  },
  {
    key: "sari",
    fullName: "Sari Dewi",
    username: "sari",
    email: "sari@example.test",
  },
  {
    key: "raka",
    fullName: "Raka Pratama",
    username: "raka",
    email: "raka@example.test",
  },
  {
    key: "nabila",
    fullName: "Nabila Putri",
    username: "nabila",
    email: "nabila@example.test",
  },
];

type DemoProject = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  creator: string;
  members: string[];
  technologies: string[];
  status: ProjectStatus;
  publishedAt: string | null;
  githubUrl: string | null;
  previewUrl: string | null;
  thumbnailPath: string | null;
  screenshots: Array<{ imagePath: string; caption: string; sortOrder: number }>;
};

const demoProjects: DemoProject[] = [
  {
    slug: "kasirkita",
    title: "KasirKita",
    summary: "Aplikasi kasir sederhana untuk kantin sekolah dengan laporan penjualan harian.",
    description:
      "KasirKita membantu petugas kantin mencatat transaksi, mengelola stok sederhana, dan melihat rekap penjualan harian.\n\nProyek ini dibuat untuk mengurangi pencatatan manual dan mempermudah pembuatan laporan akhir hari. Antarmuka dirancang sederhana agar cepat dipakai saat jam istirahat.",
    category: "web-app",
    creator: "budi",
    members: ["sari", "raka"],
    technologies: ["nextjs", "react", "typescript", "mysql"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-08T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/kasirkita",
    previewUrl: "https://kasirkita.vercel.app",
    thumbnailPath: "/seed/thumbnails/kasirkita.png",
    screenshots: [
      { imagePath: "/seed/screenshots/kasirkita-1.png", caption: "Halaman transaksi kasir", sortOrder: 1 },
      { imagePath: "/seed/screenshots/kasirkita-2.png", caption: "Rekap penjualan harian", sortOrder: 2 },
    ],
  },
  {
    slug: "ecotrack",
    title: "EcoTrack",
    summary: "Dasbor pemantauan sampah sekolah dengan pencatatan setoran dan target mingguan.",
    description:
      "EcoTrack adalah dasbor untuk memantau jumlah sampah yang berhasil dipilah di lingkungan sekolah.\n\nSetiap kelas dapat mencatat setoran sampah, melihat riwayat, dan membandingkan capaian dengan target mingguan. Data disajikan dalam tabel dan ringkasan yang mudah dibaca.",
    category: "web-app",
    creator: "sari",
    members: ["nabila"],
    technologies: ["nextjs", "react", "mysql"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-07T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/ecotrack",
    previewUrl: "https://ecotrack.vercel.app",
    thumbnailPath: "/seed/thumbnails/ecotrack.png",
    screenshots: [
      { imagePath: "/seed/screenshots/ecotrack-1.png", caption: "Dasbor capaian kelas", sortOrder: 1 },
      { imagePath: "/seed/screenshots/ecotrack-2.png", caption: "Riwayat setoran sampah", sortOrder: 2 },
    ],
  },
  {
    slug: "mathquest",
    title: "MathQuest",
    summary: "Permainan edukasi matematika dengan level bertingkat dan skor per sesi.",
    description:
      "MathQuest mengubah latihan matematika menjadi permainan singkat dengan tingkat yang meningkat.\n\nPemain menjawab soal dalam batas waktu, mendapatkan skor, dan melihat hasil akhir sesi. Proyek ini berfokus pada alur permainan yang cepat dan tampilan yang ramah untuk siswa.",
    category: "game",
    creator: "raka",
    members: ["budi"],
    technologies: ["react", "typescript", "tailwind-css"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-06T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/mathquest",
    previewUrl: "https://mathquest.vercel.app",
    thumbnailPath: "/seed/thumbnails/mathquest.png",
    screenshots: [
      { imagePath: "/seed/screenshots/mathquest-1.png", caption: "Layar mulai permainan", sortOrder: 1 },
      { imagePath: "/seed/screenshots/mathquest-2.png", caption: "Soal dan skor sesi", sortOrder: 2 },
    ],
  },
  {
    slug: "absensi-qr",
    title: "AbsensiQR",
    summary: "Pencatatan kehadiran siswa menggunakan kode QR dan rekap per kelas.",
    description:
      "AbsensiQR mempermudah pencatatan kehadiran dengan memindai kode QR siswa.\n\nPengelola kelas dapat melihat rekap harian, menandai keterlambatan, dan mengekspor data absensi. Proyek ini menekankan alur yang cepat serta data yang mudah diperiksa kembali.",
    category: "web-app",
    creator: "nabila",
    members: ["sari"],
    technologies: ["laravel", "php", "mysql"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-05T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/absensi-qr",
    previewUrl: "https://absensi-qr.vercel.app",
    thumbnailPath: "/seed/thumbnails/absensi-qr.png",
    screenshots: [
      { imagePath: "/seed/screenshots/absensi-qr-1.png", caption: "Pemindaian QR siswa", sortOrder: 1 },
      { imagePath: "/seed/screenshots/absensi-qr-2.png", caption: "Rekap kehadiran kelas", sortOrder: 2 },
    ],
  },
  {
    slug: "tanamanku",
    title: "Tanamanku",
    summary: "Alat penyiram tanaman otomatis berbasis sensor kelembapan dan dasbor pemantauan.",
    description:
      "Tanamanku menggabungkan sensor kelembapan tanah, pompa air, dan dasbor pemantauan sederhana.\n\nData sensor dikirim ke dasbor untuk menunjukkan kondisi tanaman. Pompa dapat menyala otomatis ketika kelembapan berada di bawah ambang tertentu. Proyek ini mendemonstrasikan integrasi perangkat keras dan antarmuka web.",
    category: "iot",
    creator: "budi",
    members: ["raka"],
    technologies: ["arduino", "python", "react"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-04T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/tanamanku",
    previewUrl: "https://tanamanku.vercel.app",
    thumbnailPath: "/seed/thumbnails/tanamanku.png",
    screenshots: [
      { imagePath: "/seed/screenshots/tanamanku-1.png", caption: "Dasbor kelembapan tanaman", sortOrder: 1 },
      { imagePath: "/seed/screenshots/tanamanku-2.png", caption: "Riwayat penyiraman", sortOrder: 2 },
    ],
  },
  {
    slug: "bukukita",
    title: "BukuKita",
    summary: "Perpustakaan digital kelas untuk katalog buku dan peminjaman sederhana.",
    description:
      "BukuKita adalah katalog buku kelas yang mencatat koleksi dan status peminjaman.\n\nSiswa dapat mencari buku berdasarkan judul atau penulis, sedangkan pengelola kelas dapat menambah koleksi dan mencatat pengembalian. Fokus project ini adalah alur pencarian dan pengelolaan data yang rapi.",
    category: "web-app",
    creator: "sari",
    members: ["budi", "nabila"],
    technologies: ["nextjs", "typescript", "mysql"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-03T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/bukukita",
    previewUrl: "https://bukukita.vercel.app",
    thumbnailPath: "/seed/thumbnails/bukukita.png",
    screenshots: [
      { imagePath: "/seed/screenshots/bukukita-1.png", caption: "Katalog buku kelas", sortOrder: 1 },
      { imagePath: "/seed/screenshots/bukukita-2.png", caption: "Status peminjaman", sortOrder: 2 },
    ],
  },
  {
    slug: "senyumsehat",
    title: "SenyumSehat",
    summary: "Pengingat kebiasaan kesehatan gigi dengan checklist harian yang ringan.",
    description:
      "SenyumSehat membantu pengguna membangun kebiasaan menyikat gigi pagi dan malam melalui checklist harian.\n\nTampilan dibuat sederhana agar mudah dipakai di ponsel. Proyek ini berfokus pada alur pengingat, riwayat singkat, dan desain antarmuka yang ramah.",
    category: "mobile-web",
    creator: "nabila",
    members: ["sari"],
    technologies: ["react", "figma"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-02T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/senyumsehat",
    previewUrl: null,
    thumbnailPath: "/seed/thumbnails/senyumsehat.png",
    screenshots: [
      { imagePath: "/seed/screenshots/senyumsehat-1.png", caption: "Daftar periksa harian", sortOrder: 1 },
      { imagePath: "/seed/screenshots/senyumsehat-2.png", caption: "Riwayat kebiasaan", sortOrder: 2 },
    ],
  },
  {
    slug: "datacuaca",
    title: "DataCuaca",
    summary: "Visualisasi data cuaca harian dengan grafik suhu dan curah hujan.",
    description:
      "DataCuaca menampilkan data cuaca harian dalam bentuk ringkasan dan grafik sederhana.\n\nProyek ini melatih pengolahan data, pembersihan kumpulan data, dan penyajian informasi yang mudah dipahami. Pengguna dapat memilih rentang tanggal untuk melihat pola suhu dan curah hujan.",
    category: "data-ai",
    creator: "raka",
    members: ["nabila"],
    technologies: ["python", "react"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-11-01T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/datacuaca",
    previewUrl: "https://datacuaca.vercel.app",
    thumbnailPath: "/seed/thumbnails/datacuaca.png",
    screenshots: [
      { imagePath: "/seed/screenshots/datacuaca-1.png", caption: "Grafik suhu harian", sortOrder: 1 },
      { imagePath: "/seed/screenshots/datacuaca-2.png", caption: "Ringkasan curah hujan", sortOrder: 2 },
    ],
  },
  {
    slug: "jejakkarbon",
    title: "JejakKarbon",
    summary: "Kalkulator jejak karbon harian dengan tips pengurangan emisi.",
    description:
      "JejakKarbon membantu pengguna memperkirakan jejak karbon dari aktivitas harian seperti transportasi dan penggunaan listrik.\n\nHasil perhitungan disertai tips ringan yang dapat dilakukan di sekolah atau rumah. Proyek ini menggabungkan formulir sederhana, perhitungan, dan penyajian hasil yang mudah dipahami.",
    category: "web-app",
    creator: "budi",
    members: ["sari", "nabila"],
    technologies: ["nextjs", "typescript", "tailwind-css"],
    status: ProjectStatus.PUBLISHED,
    publishedAt: "2026-10-31T09:00:00.000Z",
    githubUrl: "https://github.com/karyakelas/jejakkarbon",
    previewUrl: "https://jejakkarbon.vercel.app",
    thumbnailPath: "/seed/thumbnails/jejakkarbon.png",
    screenshots: [
      { imagePath: "/seed/screenshots/jejakkarbon-1.png", caption: "Formulir aktivitas harian", sortOrder: 1 },
      { imagePath: "/seed/screenshots/jejakkarbon-2.png", caption: "Hasil dan saran", sortOrder: 2 },
    ],
  },
  {
    slug: "quizkelas",
    title: "QuizKelas",
    summary: "Kuis interaktif untuk latihan materi kelas dengan bank soal sederhana.",
    description:
      "QuizKelas adalah aplikasi kuis untuk latihan materi kelas. Guru dapat menyiapkan bank soal, sedangkan siswa mengerjakan kuis dan melihat skor.\n\nProyek ini masih berstatus draf dan sedang dalam pengembangan.",
    category: "game",
    creator: "nabila",
    members: ["raka"],
    technologies: ["laravel", "php", "mysql"],
    status: ProjectStatus.DRAFT,
    publishedAt: null,
    githubUrl: "https://github.com/karyakelas/quizkelas",
    previewUrl: null,
    thumbnailPath: "/seed/thumbnails/quizkelas.png",
    screenshots: [],
  },
];

async function seedAdmin(): Promise<string> {
  const fullName = requiredEnv("SEED_ADMIN_NAME");
  const username = requiredEnv("SEED_ADMIN_USERNAME").toLowerCase();
  const email = requiredEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const password = requiredEnv("SEED_ADMIN_PASSWORD");

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      fullName,
      username,
      email,
      passwordHash,
      role: Role.ADMIN,
    },
    update: {
      fullName,
      username,
      passwordHash,
      role: Role.ADMIN,
    },
    select: { id: true },
  });

  return admin.id;
}

async function seedDemoUsers(): Promise<Map<string, string>> {
  const userIds = new Map<string, string>();

  for (const user of demoUsers) {
    const passwordHash = await hashPassword(randomBytes(32).toString("base64url"));
    const record = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        passwordHash,
        role: Role.USER,
      },
      update: {
        fullName: user.fullName,
        username: user.username,
        role: Role.USER,
      },
      select: { id: true },
    });

    userIds.set(user.key, record.id);
  }

  return userIds;
}

async function main() {
  console.log("Seeding KaryaKelas...");

  const adminId = await seedAdmin();
  console.log("Admin ready.");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name },
    });
  }

  for (const technology of technologies) {
    await prisma.technology.upsert({
      where: { slug: technology.slug },
      create: technology,
      update: { name: technology.name },
    });
  }

  console.log(`${categories.length} categories and ${technologies.length} technologies ready.`);

  if (process.env.SEED_DEMO_DATA !== "true") {
    console.log("SEED_DEMO_DATA is not true. Demo users and projects were skipped.");
    return;
  }

  const demoUserIds = await seedDemoUsers();
  const categoryRecords = await prisma.category.findMany({
    where: { slug: { in: categories.map((category) => category.slug) } },
    select: { id: true, slug: true },
  });
  const technologyRecords = await prisma.technology.findMany({
    where: { slug: { in: technologies.map((technology) => technology.slug) } },
    select: { id: true, slug: true },
  });

  const categoryIds = new Map(categoryRecords.map((category) => [category.slug, category.id]));
  const technologyIds = new Map(technologyRecords.map((technology) => [technology.slug, technology.id]));

  for (const project of demoProjects) {
    const categoryId = categoryIds.get(project.category);
    const creatorId = demoUserIds.get(project.creator);

    if (!categoryId || !creatorId) {
      throw new Error(`Missing relation for project ${project.slug}.`);
    }

    const memberIds = project.members
      .map((member) => demoUserIds.get(member))
      .filter((id): id is string => Boolean(id));
    const projectTechnologyIds = project.technologies
      .map((technology) => technologyIds.get(technology))
      .filter((id): id is string => Boolean(id));

    await prisma.project.upsert({
      where: { slug: project.slug },
      create: {
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        description: project.description,
        thumbnailPath: project.thumbnailPath,
        status: project.status,
        githubUrl: project.githubUrl,
        previewUrl: project.previewUrl,
        publishedAt: project.publishedAt ? new Date(project.publishedAt) : null,
        creatorId,
        categoryId,
        members: {
          create: memberIds.map((userId) => ({ userId })),
        },
        images: {
          create: project.screenshots,
        },
        projectTechnologies: {
          create: projectTechnologyIds.map((technologyId) => ({ technologyId })),
        },
      },
      update: {
        title: project.title,
        summary: project.summary,
        description: project.description,
        thumbnailPath: project.thumbnailPath,
        status: project.status,
        githubUrl: project.githubUrl,
        previewUrl: project.previewUrl,
        publishedAt: project.publishedAt ? new Date(project.publishedAt) : null,
        creatorId,
        categoryId,
        members: {
          deleteMany: {},
          create: memberIds.map((userId) => ({ userId })),
        },
        images: {
          deleteMany: {},
          create: project.screenshots,
        },
        projectTechnologies: {
          deleteMany: {},
          create: projectTechnologyIds.map((technologyId) => ({ technologyId })),
        },
      },
    });
  }

  const demoPklSubmissions = [
    {
      user: "budi",
      title: "Laporan PKL di PT Contoh Teknologi",
      company: "PT Contoh Teknologi",
      summary:
        "Selama PKL saya membantu tim pengembang menyusun modul administrasi, menguji alur aplikasi, dan mendokumentasikan hasil pekerjaan.",
      reportUrl: "https://drive.google.com/file/d/demo-budi/view",
      status: PklStatus.SUBMITTED,
      reviewNote: null,
      reviewedAt: null,
    },
    {
      user: "sari",
      title: "Laporan PKL di CV Karya Digital",
      company: "CV Karya Digital",
      summary:
        "Selama PKL saya terlibat dalam pembuatan antarmuka web, pengelolaan konten, dan pengujian tampilan pada beberapa ukuran layar.",
      reportUrl: "https://drive.google.com/file/d/demo-sari/view",
      status: PklStatus.REVIEWED,
      reviewNote: "Laporan sudah lengkap. Pertahankan kualitas dokumentasinya.",
      reviewedAt: new Date("2026-11-10T09:00:00.000Z"),
    },
  ];

  for (const submission of demoPklSubmissions) {
    const userId = demoUserIds.get(submission.user);

    if (!userId) {
      throw new Error(`Missing user for PKL submission ${submission.user}.`);
    }

    const data = {
      title: submission.title,
      company: submission.company,
      summary: submission.summary,
      reportUrl: submission.reportUrl,
      status: submission.status,
      reviewNote: submission.reviewNote,
      reviewedAt: submission.reviewedAt,
    };

    await prisma.pklSubmission.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  const demoClassProfile = {
    className: "XII RPL 1",
    tagline: "Kelas yang bikin ide jadi karya.",
    description:
      "Kami adalah kelas XII RPL 1, tempat siswa belajar membangun aplikasi, memecahkan masalah, dan bekerja dalam tim.\n\nHalaman ini merangkum cerita kelas dan wajah-wajah di balik karya yang kami buat. Sentuh atau klik foto siswa untuk melihat profil dan tautan sosial mereka.",
    photoPath: "/seed/profiles/class.png",
  };

  await prisma.classProfile.upsert({
    where: { id: 1 },
    create: demoClassProfile,
    update: demoClassProfile,
  });

  const demoStudentProfiles = [
    {
      id: "demo-student-budi",
      name: "Budi Santoso",
      role: "Ketua Kelas",
      bio: "Suka membangun aplikasi web dan mengorganisasi tim saat mengerjakan project kelas.",
      photoPath: "/seed/profiles/budi.png",
      socialLinks: [
        "https://www.tiktok.com/@budi",
        "https://www.instagram.com/budi.santoso",
        "https://github.com/budi-santoso",
      ].join("\n"),
      sortOrder: 1,
      isVisible: true,
    },
    {
      id: "demo-student-sari",
      name: "Sari Dewi",
      role: "Wakil Ketua",
      bio: "Tertarik pada desain antarmuka dan pengalaman pengguna yang sederhana.",
      photoPath: "/seed/profiles/sari.png",
      socialLinks: [
        "https://www.tiktok.com/@sari",
        "https://www.instagram.com/sari.dewi",
        "https://github.com/sari-dewi",
      ].join("\n"),
      sortOrder: 2,
      isVisible: true,
    },
    {
      id: "demo-student-raka",
      name: "Raka Pratama",
      role: "Anggota",
      bio: "Senang bereksperimen dengan game, logika, dan hal-hal teknis di balik layar.",
      photoPath: "/seed/profiles/raka.png",
      socialLinks: [
        "https://www.tiktok.com/@raka",
        "https://www.instagram.com/raka.pratama",
        "https://github.com/raka-pratama",
      ].join("\n"),
      sortOrder: 3,
      isVisible: true,
    },
    {
      id: "demo-student-nabila",
      name: "Nabila Putri",
      role: "Sekretaris",
      bio: "Menjaga catatan tim dan suka membuat dokumentasi project yang rapi.",
      photoPath: "/seed/profiles/nabila.png",
      socialLinks: [
        "https://www.tiktok.com/@nabila",
        "https://www.instagram.com/nabila.putri",
        "https://github.com/nabila-putri",
      ].join("\n"),
      sortOrder: 4,
      isVisible: true,
    },
    {
      id: "demo-student-fajar",
      name: "Fajar Nugroho",
      role: "Anggota",
      bio: "Suka mengulik perangkat keras dan sensor untuk project IoT.",
      photoPath: "/seed/profiles/fajar.png",
      socialLinks: "https://github.com/fajar-nugroho",
      sortOrder: 5,
      isVisible: true,
    },
    {
      id: "demo-student-alya",
      name: "Alya Rahma",
      role: "Bendahara",
      bio: "Memastikan kebutuhan tim tercatat dan project tetap berjalan sesuai rencana.",
      photoPath: "/seed/profiles/alya.png",
      socialLinks: "https://www.instagram.com/alya.rahma",
      sortOrder: 6,
      isVisible: true,
    },
  ];

  for (const student of demoStudentProfiles) {
    const { id, ...data } = student;

    await prisma.studentProfile.upsert({
      where: { id },
      create: student,
      update: data,
    });
  }

  console.log(`${demoProjects.length} demo projects ready. Admin id: ${adminId.slice(0, 6)}...`);
  console.log(`${demoPklSubmissions.length} demo PKL submissions ready.`);
  console.log(`1 class profile and ${demoStudentProfiles.length} student profiles ready.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
