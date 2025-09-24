const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserConfig() {
  try {
    console.log('🔍 Verificando configuração dos usuários...\n');
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        isAnonymous: true,
        aiIntegrationType: true,
        aiToken: true,
        createdAt: true,
        _count: {
          select: {
            taskLists: true
          }
        }
      }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      return;
    }

    console.log(`📊 Encontrados ${users.length} usuário(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`👤 Usuário ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nome: ${user.name || 'Anônimo'}`);
      console.log(`   Anônimo: ${user.isAnonymous}`);
      console.log(`   Tipo de IA: ${user.aiIntegrationType || 'Não configurado'}`);
      console.log(`   Token IA: ${user.aiToken ? '✅ Configurado' : '❌ Não configurado'}`);
      console.log(`   Listas de tarefas: ${user._count.taskLists}`);
      console.log(`   Criado em: ${user.createdAt.toLocaleString('pt-BR')}`);
      console.log('');
    });

    // Verificar se algum usuário tem configuração de IA
    const usersWithAI = users.filter(user => user.aiToken && user.aiIntegrationType);
    
    if (usersWithAI.length === 0) {
      console.log('⚠️  Nenhum usuário tem configuração de IA completa!');
      console.log('💡 Para testar a funcionalidade de IA, você precisa:');
      console.log('   1. Obter uma API key do Hugging Face (https://huggingface.co/settings/tokens)');
      console.log('   2. Atualizar um usuário com a API key');
      console.log('');
      console.log('🔧 Exemplo de como configurar via API:');
      console.log('   PATCH /users/{user_id}');
      console.log('   {');
      console.log('     "aiIntegrationType": "huggingface",');
      console.log('     "aiToken": "hf_your_token_here"');
      console.log('   }');
    } else {
      console.log(`✅ ${usersWithAI.length} usuário(s) com configuração de IA completa`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar configuração:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserConfig();
