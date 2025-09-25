# Assets

Esta pasta contém todos os recursos estáticos do frontend, como imagens, ícones, etc.

## Estrutura

```
assets/
├── images/           # Imagens do aplicativo
│   ├── first_task.png
│   └── index.ts      # Exports das imagens
└── index.ts          # Exports principais dos assets
```

## Como usar

### Importando imagens

```typescript
// Importação individual
import { firstTaskImage } from '@/assets';

// Importação direta
import firstTaskImage from '@/assets/images/first_task.png';
```

### Usando com Next.js Image

```tsx
import Image from 'next/image';
import { firstTaskImage } from '@/assets';

<Image
  src={firstTaskImage}
  alt="Descrição da imagem"
  width={200}
  height={150}
  className="rounded-lg"
/>
```

## Adicionando novas imagens

1. Adicione a imagem na pasta `images/`
2. Exporte a imagem no arquivo `images/index.ts`
3. A imagem estará disponível através do import `@/assets`

### Exemplo de export

```typescript
// images/index.ts
export { default as novaImagem } from './nova_imagem.png';
```
