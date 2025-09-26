import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from typing import List, Optional

# --- LlamaIndex & ChromaDB Imports ---
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.llms.openai import OpenAI
import chromadb

# --- Pydantic para Saída Estruturada ---
from pydantic import BaseModel, Field

# ==============================================================================
# 1. FUNÇÕES AUXILIARES PARA CRIAR PDFs DE EXEMPLO
# ==============================================================================
def setup_documentos(diretorio="documentos_pdf"):
    """Cria um diretório e alguns PDFs de exemplo dentro dele."""
    os.makedirs(diretorio, exist_ok=True)
    
    # PDF 1: Fatura
    caminho_fatura = os.path.join(diretorio, "fatura_001.pdf")
    if not os.path.exists(caminho_fatura):
        print(f"Criando PDF: {caminho_fatura}")
        c = canvas.Canvas(caminho_fatura, pagesize=letter)
        c.drawString(72, 800, "Fatura Nº: 2025-001")
        c.drawString(72, 780, "Cliente: Corporação Acme")
        c.drawString(72, 760, "Item: Serviço de Consultoria de Agentes IA")
        c.drawString(72, 740, "Valor Total: R$ 7500.00")
        c.drawString(72, 720, "Data de Vencimento: 15/02/2025")
        c.drawString(72, 700, "Status: Pendente")
        c.save()

    # PDF 2: Proposta de Projeto
    caminho_proposta = os.path.join(diretorio, "proposta_phoenix.pdf")
    if not os.path.exists(caminho_proposta):
        print(f"Criando PDF: {caminho_proposta}")
        c = canvas.Canvas(caminho_proposta, pagesize=letter)
        c.drawString(72, 800, "Proposta de Projeto: Phoenix")
        c.drawString(72, 780, "Cliente: Stark Industries")
        c.drawString(72, 760, "Descrição: Desenvolvimento de um novo sistema de energia.")
        c.drawString(72, 740, "Valor Total: R$ 1,200,000.00")
        c.drawString(72, 720, "Prazo: 6 meses")
        c.drawString(72, 700, "Status: Aprovado")
        c.save()

    # PDF 3: Contrato de Serviço
    caminho_contrato = os.path.join(diretorio, "contrato_servico.pdf")
    if not os.path.exists(caminho_contrato):
        print(f"Criando PDF: {caminho_contrato}")
        c = canvas.Canvas(caminho_contrato, pagesize=letter)
        c.drawString(72, 800, "Contrato de Serviço Nº: CT-2025-003")
        c.drawString(72, 780, "Cliente: TechCorp Solutions")
        c.drawString(72, 760, "Serviço: Manutenção de Sistemas")
        c.drawString(72, 740, "Valor Mensal: R$ 15,000.00")
        c.drawString(72, 720, "Duração: 12 meses")
        c.drawString(72, 700, "Início: 01/03/2025")
        c.save()

# ==============================================================================
# 2. DEFINIR O SCHEMA DE SAÍDA ESTRUTURADA (JSON)
# ==============================================================================
class EntidadeExtraida(BaseModel):
    """Modelo para os dados que queremos extrair dos documentos."""
    nome_cliente: Optional[str] = Field(description="O nome do cliente associado ao documento.")
    nome_projeto: Optional[str] = Field(description="O nome do projeto, se mencionado.")
    valor_total: Optional[float] = Field(description="O valor financeiro total encontrado no documento.")
    status: Optional[str] = Field(description="O status do documento ou projeto.")
    tipo_documento: Optional[str] = Field(description="O tipo de documento (fatura, proposta, contrato).")

# ==============================================================================
# 3. LÓGICA PRINCIPAL: INDEXAR, PERSISTIR E CONSULTAR
# ==============================================================================
def main():
    # --- Configurações ---
    PDF_DIRECTORY = "./documentos_pdf"
    DB_PATH = "./chroma_db"
    COLLECTION_NAME = "documentos_collection"

    print("🚀 Iniciando Sistema RAG com ChromaDB")
    print("=" * 50)

    # Passo 1: Criar os documentos de exemplo
    print("📄 Criando documentos de exemplo...")
    setup_documentos(PDF_DIRECTORY)

    # Passo 2: Inicializar o cliente ChromaDB persistente
    print("💾 Inicializando ChromaDB...")
    # Ele criará o diretório DB_PATH se não existir
    db = chromadb.PersistentClient(path=DB_PATH)
    
    # Passo 3: Obter ou criar a coleção no ChromaDB
    # Esta é a chave para a persistência!
    chroma_collection = db.get_or_create_collection(COLLECTION_NAME)

    # Passo 4: Criar o LlamaIndex VectorStore em cima da coleção do Chroma
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    
    # --- Lógica de "Save" vs "Load" ---
    # Verificamos se a coleção já tem documentos.
    # Se count() for 0, é a primeira vez, então precisamos indexar.
    if chroma_collection.count() == 0:
        print("🔄 Coleção vazia. Indexando novos documentos...")
        
        # Carregar documentos do diretório
        documents = SimpleDirectoryReader(PDF_DIRECTORY).load_data()
        
        # Criar o StorageContext e o Index
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        index = VectorStoreIndex.from_documents(
            documents, storage_context=storage_context
        )
        print(f"✅ Indexação concluída. {len(documents)} documentos adicionados à coleção '{COLLECTION_NAME}'.")
    else:
        print(f"⚡ Carregando índice a partir do ChromaDB existente na coleção '{COLLECTION_NAME}'...")
        # Se a coleção já tem dados, LlamaIndex pode usá-la diretamente
        index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store,
        )
        print("✅ Índice carregado com sucesso.")

    # Passo 5: Criar o Query Engine para extrair dados estruturados
    print("🧠 Configurando Query Engine...")
    query_engine = index.as_query_engine(
        output_cls=EntidadeExtraida,
        llm=OpenAI(model="gpt-4-turbo"), # Modelos fortes são melhores para extração
    )

    # Passo 6: Fazer a consulta
    # A query é projetada para forçar o RAG a olhar os dois documentos
    query_str = "Qual o valor total da proposta para a Stark Industries e quem é o cliente da fatura 2025-001?"
    
    print("\n🔍 Executando Consulta")
    print("=" * 30)
    print(f"Query: {query_str}")
    
    response = query_engine.query(query_str)
    
    # O resultado já é um objeto Pydantic
    dados_extraidos = response.response
    
    print("\n📊 Dados Estruturados Extraídos (JSON)")
    print("=" * 40)
    print(dados_extraidos.model_dump_json(indent=2))

    # Exemplo adicional: Consulta sobre todos os clientes
    print("\n🔍 Consulta Adicional: Listar todos os clientes")
    print("=" * 45)
    
    query_str2 = "Liste todos os clientes mencionados nos documentos e seus respectivos valores."
    response2 = query_engine.query(query_str2)
    dados_extraidos2 = response2.response
    
    print(f"Query: {query_str2}")
    print("\n📊 Resultado:")
    print(dados_extraidos2.model_dump_json(indent=2))

    print("\n🎉 Execução concluída com sucesso!")
    print(f"💾 Dados persistidos em: {DB_PATH}")
    print(f"📁 Documentos em: {PDF_DIRECTORY}")


if __name__ == "__main__":
    main()
