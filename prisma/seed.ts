import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Utilisateur Test',
    },
  });

  console.log('✅ Utilisateur créé:', user.email);


  // Créer une traduction de test
  await prisma.translation.create({
    data: {
      userId: user.id,
      text: 'Bonjour, comment allez-vous ?',
      type: 'text',
    },
  });

  console.log('✅ Traduction test créée');
  console.log('\n🎉 Seeding terminé !');
  console.log(`\n📊 Résumé :`);
  console.log(`   - 1 utilisateur (email: test@example.com, password: password123)`);
  console.log(`   - 1 traduction de langue des signes`);
  console.log(`   - 1 traduction exemple`);
  console.log(`\n👉 Tu peux maintenant te connecter avec test@example.com / password123`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
