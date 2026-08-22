import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const colleges = [
  {
    name: "IIT Hyderabad",
    slug: "iit-hyderabad",
    location: "Hyderabad",
    state: "Telangana",
    description:
      "A premier institute offering engineering, science and technology programs.",
    fees: 250000,
    rating: 4.6,
    placement: 2200000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Electrical Engineering", duration: "4 Years" },
      { name: "Mechanical Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "Osmania University",
    slug: "osmania-university",
    location: "Hyderabad",
    state: "Telangana",
    description:
      "A historic university offering undergraduate and postgraduate programs.",
    fees: 65000,
    rating: 4.2,
    placement: 650000,
    courses: [
      { name: "Computer Science", duration: "4 Years" },
      { name: "Electronics and Communication", duration: "4 Years" },
      { name: "Mechanical Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "BITS Pilani",
    slug: "bits-pilani",
    location: "Pilani",
    state: "Rajasthan",
    description:
      "A leading private institute known for engineering and technology education.",
    fees: 550000,
    rating: 4.7,
    placement: 1800000,
    courses: [
      { name: "Computer Science", duration: "4 Years" },
      { name: "Electrical and Electronics", duration: "4 Years" },
      { name: "Mechanical Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "VIT Vellore",
    slug: "vit-vellore",
    location: "Vellore",
    state: "Tamil Nadu",
    description:
      "A private university offering a wide range of engineering programs.",
    fees: 200000,
    rating: 4.4,
    placement: 900000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Information Technology", duration: "4 Years" },
      { name: "Artificial Intelligence", duration: "4 Years" },
    ],
  },
  {
    name: "IIT Bombay",
    slug: "iit-bombay",
    location: "Mumbai",
    state: "Maharashtra",
    description:
      "One of India's leading institutes for engineering and technology.",
    fees: 240000,
    rating: 4.8,
    placement: 2500000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Electrical Engineering", duration: "4 Years" },
      { name: "Aerospace Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "IIT Delhi",
    slug: "iit-delhi",
    location: "New Delhi",
    state: "Delhi",
    description:
      "A premier technical institute with strong engineering and research programs.",
    fees: 240000,
    rating: 4.8,
    placement: 2400000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Electrical Engineering", duration: "4 Years" },
      { name: "Civil Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "NIT Warangal",
    slug: "nit-warangal",
    location: "Warangal",
    state: "Telangana",
    description:
      "A leading national institute offering engineering and technology programs.",
    fees: 150000,
    rating: 4.5,
    placement: 1200000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Electronics and Communication", duration: "4 Years" },
      { name: "Civil Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "IIT Madras",
    slug: "iit-madras",
    location: "Chennai",
    state: "Tamil Nadu",
    description:
      "A premier research and engineering institute in India.",
    fees: 240000,
    rating: 4.9,
    placement: 2300000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Mechanical Engineering", duration: "4 Years" },
      { name: "Electrical Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "IIT Kanpur",
    slug: "iit-kanpur",
    location: "Kanpur",
    state: "Uttar Pradesh",
    description:
      "A leading technology institute known for engineering, science and research programs.",
    fees: 230000,
    rating: 4.8,
    placement: 2100000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Aerospace Engineering", duration: "4 Years" },
      { name: "Chemical Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "IIT Kharagpur",
    slug: "iit-kharagpur",
    location: "Kharagpur",
    state: "West Bengal",
    description:
      "A historic institute offering a broad range of engineering and technology programs.",
    fees: 235000,
    rating: 4.7,
    placement: 2000000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Electrical Engineering", duration: "4 Years" },
      { name: "Civil Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "IIT Roorkee",
    slug: "iit-roorkee",
    location: "Roorkee",
    state: "Uttarakhand",
    description:
      "One of India's oldest technical institutions with strong engineering and research programs.",
    fees: 225000,
    rating: 4.6,
    placement: 1900000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Electronics and Communication", duration: "4 Years" },
      { name: "Architecture", duration: "5 Years" },
    ],
  },
  {
    name: "NIT Trichy",
    slug: "nit-trichy",
    location: "Tiruchirappalli",
    state: "Tamil Nadu",
    description:
      "A respected national institute offering practical engineering and technology education.",
    fees: 145000,
    rating: 4.5,
    placement: 1100000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Electronics and Communication", duration: "4 Years" },
      { name: "Production Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "IIM Bangalore",
    slug: "iim-bangalore",
    location: "Bengaluru",
    state: "Karnataka",
    description:
      "A leading management institute offering business, leadership and entrepreneurship programs.",
    fees: 1250000,
    rating: 4.8,
    placement: 3500000,
    courses: [
      { name: "Business Administration", duration: "2 Years" },
      { name: "Management Studies", duration: "2 Years" },
      { name: "Business Analytics", duration: "1 Year" },
    ],
  },
  {
    name: "Manipal Institute of Technology",
    slug: "manipal-institute-of-technology",
    location: "Manipal",
    state: "Karnataka",
    description:
      "A private engineering institute with modern facilities and diverse technology programs.",
    fees: 420000,
    rating: 4.3,
    placement: 850000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Information Technology", duration: "4 Years" },
      { name: "Biomedical Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "Anna University",
    slug: "anna-university",
    location: "Chennai",
    state: "Tamil Nadu",
    description:
      "A public university offering engineering, technology and applied science programs.",
    fees: 70000,
    rating: 4.4,
    placement: 750000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Information Technology", duration: "4 Years" },
      { name: "Civil Engineering", duration: "4 Years" },
    ],
  },
  {
    name: "Delhi Technological University",
    slug: "delhi-technological-university",
    location: "New Delhi",
    state: "Delhi",
    description:
      "A well-known technical university focused on engineering, innovation and technology.",
    fees: 180000,
    rating: 4.4,
    placement: 1000000,
    courses: [
      { name: "Computer Science and Engineering", duration: "4 Years" },
      { name: "Software Engineering", duration: "4 Years" },
      { name: "Environmental Engineering", duration: "4 Years" },
    ],
  },
];

async function main() {
  await prisma.savedCollege.deleteMany();
  await prisma.course.deleteMany();
  await prisma.college.deleteMany();

  for (const college of colleges) {
    await prisma.college.create({
      data: {
        name: college.name,
        slug: college.slug,
        location: college.location,
        state: college.state,
        description: college.description,
        fees: college.fees,
        rating: college.rating,
        placement: college.placement,
        courses: {
          create: college.courses,
        },
      },
    });
  }

  console.log(`Seeded ${colleges.length} colleges successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });