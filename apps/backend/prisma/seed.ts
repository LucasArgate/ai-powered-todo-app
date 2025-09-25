import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create AI providers
  const providers = await Promise.all([
    prisma.provider.upsert({
      where: { name: 'huggingface' },
      update: {},
      create: {
        name: 'huggingface',
        description: 'Hugging Face Inference API - Modelos gratuitos disponíveis',
        free: true,
        models: JSON.stringify([
          'microsoft/DialoGPT-medium',
          'microsoft/DialoGPT-large',
          'facebook/blenderbot-400M-distill',
          'mistralai/Mistral-7B-Instruct-v0.2',
          'google/flan-t5-large',
          'microsoft/DialoGPT-small'
        ]),
        tokenUrl: 'https://huggingface.co/settings/tokens',
        documentationUrl: 'https://huggingface.co/docs/api-inference',
        isActive: true,
      },
    }),
    prisma.provider.upsert({
      where: { name: 'openrouter' },
      update: {},
      create: {
        name: 'openrouter',
        description: 'OpenRouter - Acesso a múltiplos modelos de IA',
        free: false,
        models: JSON.stringify([
          'openai/gpt-3.5-turbo',
          'openai/gpt-4',
          'openai/gpt-4-turbo',
          'anthropic/claude-3-haiku',
          'anthropic/claude-3-sonnet',
          'anthropic/claude-3-opus',
          'google/gemini-pro',
          'meta-llama/llama-2-70b-chat',
          'mistralai/mistral-7b-instruct'
        ]),
        tokenUrl: 'https://openrouter.ai/keys',
        documentationUrl: 'https://openrouter.ai/docs',
        isActive: true,
      },
    }),
    prisma.provider.upsert({
      where: { name: 'gemini' },
      update: {},
      create: {
        name: 'gemini',
        description: 'Google Gemini - Modelos avançados do Google',
        free: false,
        models: JSON.stringify([
          'gemini-pro',
          'gemini-pro-vision',
          'gemini-1.5-pro',
          'gemini-1.5-flash'
        ]),
        tokenUrl: 'https://aistudio.google.com/app/apikey',
        documentationUrl: 'https://ai.google.dev/docs',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created/updated providers:', providers.map(p => p.name).join(', '));

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
