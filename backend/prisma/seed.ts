import { PrismaClient, UserRole, ListingStatus, BookingStatus, DepositStatus, VerificationStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { faker } from '@faker-js/faker';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://rentloop:rentloop_secret@localhost:5432/rentloop',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Clearing database...');
  // Clear all data to ensure a fresh start
  await prisma.rentRecord.deleteMany();
  await prisma.propertyInspection.deleteMany();
  await prisma.property.deleteMany();
  await prisma.contactRevealed.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.referralCode.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.depositAuditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.conditionPhoto.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listingBadge.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleared. Seeding data...');

  // 1. Categories
  const categoriesToCreate = [
    { name: 'Cameras', slug: 'cameras', icon: 'camera' },
    { name: 'Vehicles', slug: 'vehicles', icon: 'car' },
    { name: 'Tools', slug: 'tools', icon: 'tool' },
    { name: 'Real Estate', slug: 'real-estate', icon: 'home' },
    { name: 'Event Gear', slug: 'event-gear', icon: 'music' },
    { name: 'Electronics', slug: 'electronics', icon: 'laptop' },
  ];

  const categories = await Promise.all(
    categoriesToCreate.map(cat => 
      prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          isEnabled: true,
        }
      })
    )
  );

  console.log(`Created ${categories.length} categories.`);

  // 2. Users (1 ADMIN, ~30 LISTER, ~70 RENTER)
  const users: any[] = [];
  
  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@rentloop.lk',
      passwordHash: 'hashed_password_mock',
      role: UserRole.ADMIN,
      verificationStatus: VerificationStatus.APPROVED,
      isActive: true,
    }
  });
  users.push(admin);

  // Random Users
  for (let i = 0; i < 100; i++) {
    const role = i < 30 ? UserRole.LISTER : UserRole.RENTER;
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: 'hashed_password_mock',
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatar(),
        role: role,
        verificationStatus: faker.helpers.arrayElement(Object.values(VerificationStatus)),
        isActive: true,
        createdAt: faker.date.past(),
      }
    });
    users.push(user);
  }

  console.log(`Created ${users.length} users.`);
  const listers = users.filter(u => u.role === UserRole.LISTER);
  const renters = users.filter(u => u.role === UserRole.RENTER);

  // 3. Listings (~300)
  const listings: any[] = [];
  for (let i = 0; i < 300; i++) {
    const lister = faker.helpers.arrayElement(listers);
    const category = faker.helpers.arrayElement(categories);
    
    const listing = await prisma.listing.create({
      data: {
        title: faker.commerce.productName(),
        slug: faker.helpers.slugify(faker.commerce.productName() + ' ' + faker.string.uuid()),
        description: faker.commerce.productDescription(),
        categoryId: category.id,
        ownerId: lister.id,
        dailyRate: faker.number.int({ min: 1000, max: 20000 }),
        depositAmount: faker.number.int({ min: 5000, max: 50000 }),
        location: faker.location.city(),
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
        status: faker.helpers.arrayElement(Object.values(ListingStatus)),
        averageRating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
        reviewCount: faker.number.int({ min: 0, max: 50 }),
        viewCount: faker.number.int({ min: 0, max: 1000 }),
      }
    });
    listings.push(listing);
  }

  console.log(`Created ${listings.length} listings.`);

  // 4. Bookings (~500)
  let bookingsCreated = 0;
  for (let i = 0; i < 500; i++) {
    const listing = faker.helpers.arrayElement(listings);
    const renter = faker.helpers.arrayElement(renters);
    
    // Don't let lister rent their own item
    if (listing.ownerId === renter.id) continue;

    const startDate = faker.date.future();
    const totalDays = faker.number.int({ min: 1, max: 14 });
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDays);

    const rentalAmount = totalDays * listing.dailyRate;
    const platformFeePercent = 10;
    const platformFeeAmount = (rentalAmount * platformFeePercent) / 100;
    const totalCharged = rentalAmount + platformFeeAmount + listing.depositAmount;

    await prisma.booking.create({
      data: {
        listingId: listing.id,
        renterId: renter.id,
        startDate,
        endDate,
        totalDays,
        rentalAmount,
        platformFeePercent,
        platformFeeAmount,
        depositAmount: listing.depositAmount,
        totalCharged,
        status: faker.helpers.arrayElement(Object.values(BookingStatus)),
        depositStatus: faker.helpers.arrayElement(Object.values(DepositStatus)),
      }
    });
    bookingsCreated++;
  }

  console.log(`Created ${bookingsCreated} bookings.`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
