import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a demo user
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      isAnonymous: false,
      aiIntegrationType: 'openrouter',
    },
  });

  console.log('✅ Created user:', user.name);

  // Create a demo task list
  const taskList = await prisma.taskList.create({
    data: {
      userId: user.id,
      name: 'Minha Lista de Tarefas',
      description: 'Lista de exemplo para demonstrar o funcionamento do app',
      iaPrompt: 'Ajuda-me a organizar minhas tarefas de forma eficiente',
    },
  });

  console.log('✅ Created task list:', taskList.name);

  // Create some demo tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        listId: taskList.id,
        title: 'Configurar o ambiente de desenvolvimento',
        position: 1,
        isCompleted: true,
      },
    }),
    prisma.task.create({
      data: {
        listId: taskList.id,
        title: 'Implementar autenticação',
        position: 2,
        isCompleted: false,
      },
    }),
    prisma.task.create({
      data: {
        listId: taskList.id,
        title: 'Criar interface de usuário',
        position: 3,
        isCompleted: false,
      },
    }),
    prisma.task.create({
      data: {
        listId: taskList.id,
        title: 'Testar integração com IA',
        position: 4,
        isCompleted: false,
      },
    }),
  ]);

  console.log('✅ Created tasks:', tasks.length);

  // Create an anonymous user with tasks
  const anonymousUser = await prisma.user.create({
    data: {
      isAnonymous: true,
    },
  });

  const anonymousTaskList = await prisma.taskList.create({
    data: {
      userId: anonymousUser.id,
      name: 'Tarefas Anônimas',
      description: 'Lista de tarefas para usuário anônimo',
    },
  });

  await prisma.task.create({
    data: {
      listId: anonymousTaskList.id,
      title: 'Explorar funcionalidades do app',
      position: 1,
      isCompleted: false,
    },
  });

  console.log('✅ Created anonymous user and task list');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
