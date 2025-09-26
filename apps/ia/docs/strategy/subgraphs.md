# Subgrafos

Subgrafos no LangGraph permitem modularizar workflows complexos em componentes reutilizáveis e independentes. Isso facilita a manutenção, reutilização e composição de funcionalidades avançadas em sistemas de IA.

## Por que Subgrafos são Importantes?

- **Modularidade**: Componentes independentes e reutilizáveis
- **Manutenibilidade**: Código mais organizado e fácil de manter
- **Reutilização**: Mesma lógica pode ser usada em diferentes contextos
- **Testabilidade**: Cada subgrafo pode ser testado isoladamente
- **Escalabilidade**: Facilita desenvolvimento de sistemas complexos

## Exemplo Prático: Sistema de E-commerce com Subgrafos

```python
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
from typing_extensions import TypedDict, Annotated
import operator
from enum import Enum

# Estados compartilhados
class OrderStatus(str, Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    PAYMENT_PROCESSING = "payment_processing"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class EcommerceState(TypedDict):
    messages: Annotated[list, operator.add]
    customer_id: str
    order_id: str
    products: list
    order_total: float
    payment_info: dict
    shipping_info: dict
    order_status: OrderStatus
    validation_results: dict
    payment_results: dict
    shipping_results: dict

# SUBGRAFO 1: Validação de Produto
def create_product_validation_subgraph():
    """Subgrafo para validação de produtos"""
    
    def check_inventory_node(state: EcommerceState):
        """Verifica disponibilidade no estoque"""
        
        print(f"📦 Verificando estoque para pedido {state['order_id']}...")
        
        # Simula verificação de estoque
        inventory_results = []
        for product in state["products"]:
            available = True  # Simula verificação
            inventory_results.append({
                "product_id": product["id"],
                "requested_qty": product["quantity"],
                "available_qty": product["quantity"] if available else 0,
                "available": available
            })
        
        all_available = all(item["available"] for item in inventory_results)
        
        return {
            "messages": [AIMessage(content=f"✅ Estoque verificado. Disponível: {all_available}")],
            "validation_results": {
                **state.get("validation_results", {}),
                "inventory": {
                    "items": inventory_results,
                    "all_available": all_available
                }
            }
        }
    
    def validate_pricing_node(state: EcommerceState):
        """Valida preços dos produtos"""
        
        print(f"💰 Validando preços para pedido {state['order_id']}...")
        
        # Simula validação de preços
        pricing_valid = True
        calculated_total = sum(p["price"] * p["quantity"] for p in state["products"])
        
        price_validation = {
            "calculated_total": calculated_total,
            "received_total": state["order_total"],
            "valid": abs(calculated_total - state["order_total"]) < 0.01
        }
        
        return {
            "messages": [AIMessage(content=f"✅ Preços validados. Total: ${calculated_total:.2f}")],
            "validation_results": {
                **state.get("validation_results", {}),
                "pricing": price_validation
            }
        }
    
    def route_validation(state: EcommerceState):
        """Roteia validação baseado no que já foi feito"""
        
        validation_results = state.get("validation_results", {})
        
        if "inventory" not in validation_results:
            return "check_inventory"
        elif "pricing" not in validation_results:
            return "validate_pricing"
        else:
            return END
    
    # Constrói subgrafo de validação
    validation_builder = StateGraph(EcommerceState)
    
    validation_builder.add_node("check_inventory", check_inventory_node)
    validation_builder.add_node("validate_pricing", validate_pricing_node)
    
    validation_builder.add_conditional_edges(
        START,
        route_validation,
        {
            "check_inventory": "check_inventory",
            "validate_pricing": "validate_pricing",
            END: END
        }
    )
    
    validation_builder.add_conditional_edges(
        "check_inventory",
        route_validation,
        {
            "validate_pricing": "validate_pricing",
            END: END
        }
    )
    
    validation_builder.add_edge("validate_pricing", END)
    
    return validation_builder.compile()

# SUBGRAFO 2: Processamento de Pagamento
def create_payment_processing_subgraph():
    """Subgrafo para processamento de pagamento"""
    
    def validate_payment_method_node(state: EcommerceState):
        """Valida método de pagamento"""
        
        print(f"💳 Validando método de pagamento para pedido {state['order_id']}...")
        
        payment_info = state["payment_info"]
        
        # Simula validação do método de pagamento
        validation = {
            "method": payment_info.get("method"),
            "valid_card": True,  # Simula validação
            "sufficient_funds": True,  # Simula verificação
            "fraud_check": "passed"
        }
        
        return {
            "messages": [AIMessage(content="✅ Método de pagamento validado")],
            "payment_results": {
                **state.get("payment_results", {}),
                "validation": validation
            }
        }
    
    def process_payment_node(state: EcommerceState):
        """Processa o pagamento"""
        
        print(f"⚡ Processando pagamento para pedido {state['order_id']}...")
        
        # Simula processamento do pagamento
        payment_processing = {
            "amount": state["order_total"],
            "transaction_id": f"TXN_{state['order_id']}_001",
            "status": "completed",
            "processor_response": "approved",
            "timestamp": "2024-01-01T10:00:00Z"
        }
        
        return {
            "messages": [AIMessage(content=f"✅ Pagamento processado. Transação: {payment_processing['transaction_id']}")],
            "payment_results": {
                **state.get("payment_results", {}),
                "processing": payment_processing
            },
            "order_status": OrderStatus.CONFIRMED
        }
    
    def handle_payment_failure_node(state: EcommerceState):
        """Trata falhas no pagamento"""
        
        print(f"❌ Tratando falha no pagamento para pedido {state['order_id']}...")
        
        return {
            "messages": [AIMessage(content="❌ Falha no processamento do pagamento")],
            "order_status": OrderStatus.CANCELLED
        }
    
    def route_payment(state: EcommerceState):
        """Roteia processamento de pagamento"""
        
        payment_results = state.get("payment_results", {})
        
        if "validation" not in payment_results:
            return "validate_payment_method"
        elif payment_results["validation"]["valid_card"] and payment_results["validation"]["sufficient_funds"]:
            return "process_payment"
        else:
            return "handle_payment_failure"
    
    # Constrói subgrafo de pagamento
    payment_builder = StateGraph(EcommerceState)
    
    payment_builder.add_node("validate_payment_method", validate_payment_method_node)
    payment_builder.add_node("process_payment", process_payment_node)
    payment_builder.add_node("handle_payment_failure", handle_payment_failure_node)
    
    payment_builder.add_conditional_edges(
        START,
        route_payment,
        {
            "validate_payment_method": "validate_payment_method",
            "process_payment": "process_payment",
            "handle_payment_failure": "handle_payment_failure"
        }
    )
    
    payment_builder.add_conditional_edges(
        "validate_payment_method",
        route_payment,
        {
            "process_payment": "process_payment",
            "handle_payment_failure": "handle_payment_failure"
        }
    )
    
    payment_builder.add_edge("process_payment", END)
    payment_builder.add_edge("handle_payment_failure", END)
    
    return payment_builder.compile()

# SUBGRAFO 3: Gestão de Envio
def create_shipping_management_subgraph():
    """Subgrafo para gestão de envio"""
    
    def calculate_shipping_node(state: EcommerceState):
        """Calcula opções de envio"""
        
        print(f"📬 Calculando opções de envio para pedido {state['order_id']}...")
        
        shipping_info = state["shipping_info"]
        
        # Simula cálculo de envio
        shipping_options = [
            {
                "method": "standard",
                "cost": 9.99,
                "estimated_days": 5
            },
            {
                "method": "express",
                "cost": 19.99,
                "estimated_days": 2
            },
            {
                "method": "overnight",
                "cost": 39.99,
                "estimated_days": 1
            }
        ]
        
        return {
            "messages": [AIMessage(content=f"✅ {len(shipping_options)} opções de envio calculadas")],
            "shipping_results": {
                **state.get("shipping_results", {}),
                "options": shipping_options
            }
        }
    
    def create_shipping_label_node(state: EcommerceState):
        """Cria etiqueta de envio"""
        
        print(f"🏷️ Criando etiqueta de envio para pedido {state['order_id']}...")
        
        # Simula criação de etiqueta
        shipping_label = {
            "label_id": f"LABEL_{state['order_id']}",
            "tracking_number": f"TRACK_{state['order_id']}_001",
            "carrier": "FedEx",
            "service": "Ground",
            "created_at": "2024-01-01T10:00:00Z"
        }
        
        return {
            "messages": [AIMessage(content=f"✅ Etiqueta criada. Rastreamento: {shipping_label['tracking_number']}")],
            "shipping_results": {
                **state.get("shipping_results", {}),
                "label": shipping_label
            },
            "order_status": OrderStatus.SHIPPED
        }
    
    def route_shipping(state: EcommerceState):
        """Roteia processo de envio"""
        
        shipping_results = state.get("shipping_results", {})
        
        if "options" not in shipping_results:
            return "calculate_shipping"
        else:
            return "create_shipping_label"
    
    # Constrói subgrafo de envio
    shipping_builder = StateGraph(EcommerceState)
    
    shipping_builder.add_node("calculate_shipping", calculate_shipping_node)
    shipping_builder.add_node("create_shipping_label", create_shipping_label_node)
    
    shipping_builder.add_conditional_edges(
        START,
        route_shipping,
        {
            "calculate_shipping": "calculate_shipping",
            "create_shipping_label": "create_shipping_label"
        }
    )
    
    shipping_builder.add_edge("calculate_shipping", "create_shipping_label")
    shipping_builder.add_edge("create_shipping_label", END)
    
    return shipping_builder.compile()

# GRAFO PRINCIPAL: Orquestra todos os subgrafos
def create_ecommerce_main_graph():
    """Cria grafo principal que orquestra todos os subgrafos"""
    
    # Compila subgrafos
    product_validation_subgraph = create_product_validation_subgraph()
    payment_processing_subgraph = create_payment_processing_subgraph()
    shipping_management_subgraph = create_shipping_management_subgraph()
    
    def validate_order_node(state: EcommerceState):
        """Nó que executa subgrafo de validação"""
        
        print(f"🔍 Executando validação de pedido {state['order_id']}...")
        
        # Executa subgrafo de validação
        validation_result = product_validation_subgraph.invoke(state)
        
        return {
            "messages": validation_result["messages"],
            "validation_results": validation_result["validation_results"],
            "order_status": OrderStatus.VALIDATED
        }
    
    def process_payment_node(state: EcommerceState):
        """Nó que executa subgrafo de pagamento"""
        
        print(f"💳 Executando processamento de pagamento {state['order_id']}...")
        
        # Executa subgrafo de pagamento
        payment_result = payment_processing_subgraph.invoke(state)
        
        return {
            "messages": payment_result["messages"],
            "payment_results": payment_result["payment_results"],
            "order_status": payment_result["order_status"]
        }
    
    def manage_shipping_node(state: EcommerceState):
        """Nó que executa subgrafo de envio"""
        
        print(f"📦 Executando gestão de envio {state['order_id']}...")
        
        # Executa subgrafo de envio
        shipping_result = shipping_management_subgraph.invoke(state)
        
        return {
            "messages": shipping_result["messages"],
            "shipping_results": shipping_result["shipping_results"],
            "order_status": shipping_result["order_status"]
        }
    
    def route_main_flow(state: EcommerceState):
        """Roteia fluxo principal"""
        
        status = state["order_status"]
        
        if status == OrderStatus.PENDING:
            return "validate_order"
        elif status == OrderStatus.VALIDATED:
            return "process_payment"
        elif status == OrderStatus.CONFIRMED:
            return "manage_shipping"
        else:
            return END
    
    # Constrói grafo principal
    main_builder = StateGraph(EcommerceState)
    
    main_builder.add_node("validate_order", validate_order_node)
    main_builder.add_node("process_payment", process_payment_node)
    main_builder.add_node("manage_shipping", manage_shipping_node)
    
    main_builder.add_conditional_edges(
        START,
        route_main_flow,
        {
            "validate_order": "validate_order",
            "process_payment": "process_payment",
            "manage_shipping": "manage_shipping",
            END: END
        }
    )
    
    main_builder.add_conditional_edges(
        "validate_order",
        route_main_flow,
        {
            "process_payment": "process_payment",
            END: END
        }
    )
    
    main_builder.add_conditional_edges(
        "process_payment",
        route_main_flow,
        {
            "manage_shipping": "manage_shipping",
            END: END
        }
    )
    
    main_builder.add_edge("manage_shipping", END)
    
    return main_builder.compile()

# Demonstração do sistema com subgrafos
def demonstrate_subgraphs_system():
    """Demonstra o sistema de e-commerce com subgrafos"""
    
    print("=== Sistema de E-commerce com Subgrafos ===\n")
    
    # Cria grafo principal
    ecommerce_graph = create_ecommerce_main_graph()
    
    # Estado inicial do pedido
    initial_state = {
        "messages": [],
        "customer_id": "CUSTOMER_001",
        "order_id": "ORDER_001",
        "products": [
            {"id": "PROD_001", "name": "Laptop", "price": 999.99, "quantity": 1},
            {"id": "PROD_002", "name": "Mouse", "price": 29.99, "quantity": 2}
        ],
        "order_total": 1059.97,
        "payment_info": {
            "method": "credit_card",
            "card_number": "****-****-****-1234",
            "cvv": "***"
        },
        "shipping_info": {
            "address": "123 Main St",
            "city": "Anytown",
            "state": "ST",
            "zip": "12345"
        },
        "order_status": OrderStatus.PENDING,
        "validation_results": {},
        "payment_results": {},
        "shipping_results": {}
    }
    
    print("🚀 Processando pedido de e-commerce...")
    
    # Executa workflow completo
    result = ecommerce_graph.invoke(initial_state)
    
    print(f"\n✅ Pedido processado com sucesso!")
    print(f"📋 Status final: {result['order_status']}")
    print(f"💬 Mensagens: {len(result['messages'])}")
    
    # Mostra resultados de cada subgrafo
    print("\n" + "="*60)
    print("RESULTADOS DOS SUBGRAFOS")
    print("="*60)
    
    print(f"\n📦 Validação de Produtos:")
    validation = result.get("validation_results", {})
    if validation:
        print(f"   - Estoque: {'✅' if validation.get('inventory', {}).get('all_available') else '❌'}")
        print(f"   - Preços: {'✅' if validation.get('pricing', {}).get('valid') else '❌'}")
    
    print(f"\n💳 Processamento de Pagamento:")
    payment = result.get("payment_results", {})
    if payment:
        processing = payment.get("processing", {})
        print(f"   - Transação: {processing.get('transaction_id', 'N/A')}")
        print(f"   - Status: {processing.get('status', 'N/A')}")
    
    print(f"\n📬 Gestão de Envio:")
    shipping = result.get("shipping_results", {})
    if shipping:
        label = shipping.get("label", {})
        print(f"   - Rastreamento: {label.get('tracking_number', 'N/A')}")
        print(f"   - Transportadora: {label.get('carrier', 'N/A')}")

# Sistema de Reutilização de Subgrafos
class SubgraphLibrary:
    """Biblioteca de subgrafos reutilizáveis"""
    
    def __init__(self):
        self.subgraphs = {}
    
    def register_subgraph(self, name: str, subgraph, description: str):
        """Registra um subgrafo na biblioteca"""
        
        self.subgraphs[name] = {
            "graph": subgraph,
            "description": description,
            "usage_count": 0
        }
    
    def get_subgraph(self, name: str):
        """Recupera um subgrafo da biblioteca"""
        
        if name in self.subgraphs:
            self.subgraphs[name]["usage_count"] += 1
            return self.subgraphs[name]["graph"]
        
        raise ValueError(f"Subgrafo '{name}' não encontrado")
    
    def list_subgraphs(self):
        """Lista todos os subgrafos disponíveis"""
        
        return {
            name: {
                "description": info["description"],
                "usage_count": info["usage_count"]
            }
            for name, info in self.subgraphs.items()
        }

# Demonstração da biblioteca de subgrafos
def demonstrate_subgraph_library():
    """Demonstra reutilização de subgrafos"""
    
    print("\n=== Biblioteca de Subgrafos Reutilizáveis ===\n")
    
    # Cria biblioteca
    library = SubgraphLibrary()
    
    # Registra subgrafos
    library.register_subgraph(
        "product_validation",
        create_product_validation_subgraph(),
        "Valida produtos e estoque"
    )
    
    library.register_subgraph(
        "payment_processing",
        create_payment_processing_subgraph(),
        "Processa pagamentos"
    )
    
    library.register_subgraph(
        "shipping_management",
        create_shipping_management_subgraph(),
        "Gerencia envios"
    )
    
    # Lista subgrafos disponíveis
    print("Subgrafos disponíveis:")
    for name, info in library.list_subgraphs().items():
        print(f"  📦 {name}: {info['description']} (Usado {info['usage_count']}x)")
    
    # Reutiliza subgrafo
    print(f"\n🔄 Reutilizando subgrafo de validação...")
    validation_subgraph = library.get_subgraph("product_validation")
    print(f"✅ Subgrafo recuperado e pronto para uso")

if __name__ == "__main__":
    demonstrate_subgraphs_system()
    demonstrate_subgraph_library()
    
    print("\n=== Benefícios dos Subgrafos ===")
    print("✅ Modularidade e organização do código")
    print("✅ Reutilização de componentes")
    print("✅ Facilidade de manutenção")
    print("✅ Testabilidade individual")
    print("✅ Composição flexível de workflows")
    print("✅ Desenvolvimento em equipe")
    print("✅ Evolução independente de componentes")
```

## Características dos Subgrafos

### 1. **Encapsulamento**
- Lógica independente e autônoma
- Interface bem definida de entrada e saída
- Estado compartilhado controlado

### 2. **Composição**
- Subgrafos podem ser combinados livremente
- Orquestração através do grafo principal
- Comunicação via estado compartilhado

### 3. **Reutilização**
- Mesmo subgrafo usado em múltiplos contextos
- Biblioteca centralizada de componentes
- Versionamento e evolução independente

### 4. **Testabilidade**
- Cada subgrafo pode ser testado isoladamente
- Mocking de dependências facilitado
- Debugging mais preciso

## Casos de Uso Práticos

1. **E-commerce**: Validação, pagamento, envio como subgrafos
2. **Workflow de Aprovação**: Diferentes tipos de aprovação modularizados
3. **Processamento de Documentos**: OCR, análise, classificação separados
4. **Sistemas de IA**: Pré-processamento, inferência, pós-processamento
5. **Integração de APIs**: Diferentes serviços como subgrafos independentes

## Padrões de Design com Subgrafos

### 1. **Pipeline Pattern**
```python
# Subgrafos em sequência
main_graph = input_subgraph → processing_subgraph → output_subgraph
```

### 2. **Fan-out/Fan-in Pattern**
```python
# Processamento paralelo
main_graph = input → [subgraph1, subgraph2, subgraph3] → aggregation
```

### 3. **Conditional Routing Pattern**
```python
# Roteamento baseado em condições
main_graph = input → router → [subgraph_A | subgraph_B | subgraph_C]
```

### 4. **Hierarchical Pattern**
```python
# Subgrafos aninhados
main_graph = level1_subgraph(level2_subgraph(level3_subgraph))
```

## Benefícios Operacionais

- **Desenvolvimento Paralelo**: Equipes podem trabalhar em subgrafos independentes
- **Manutenção Simplificada**: Mudanças isoladas em componentes específicos
- **Debugging Eficiente**: Problemas localizados em subgrafos específicos
- **Reutilização Máxima**: Componentes usados em múltiplos projetos
- **Escalabilidade**: Adição de funcionalidades através de novos subgrafos
- **Testabilidade**: Cobertura de testes mais abrangente e focada

Os subgrafos transformam sistemas monolíticos em arquiteturas modulares e flexíveis, essenciais para construir aplicações de IA robustas e escaláveis.
