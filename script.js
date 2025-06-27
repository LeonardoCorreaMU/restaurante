document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS GLOBAIS ---
    let carrinho = [];
    const API_URL_SEARCH = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const API_URL_LOOKUP = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

    // --- ELEMENTOS DO DOM ---
    const pratosGrid = document.getElementById('pratos-grid');
    const pratosView = document.getElementById('pratos-view');
    const detalhesView = document.getElementById('detalhes-view');
    const detalhesHeaderContainer = document.getElementById('detalhes-header-container');
    const detalhesContent = document.getElementById('detalhes-content');
    
    const carrinhoBtnAbrir = document.getElementById('carrinho-btn-abrir');
    const carrinhoBtnFechar = document.getElementById('carrinho-btn-fechar');
    const carrinhoModalOverlay = document.getElementById('carrinho-modal-overlay');
    const carrinhoItensContainer = document.getElementById('carrinho-itens');
    const carrinhoTotalContainer = document.getElementById('carrinho-total');
    const carrinhoContador = document.getElementById('carrinho-contador');
    const btnFinalizar = document.getElementById('btn-finalizar');

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loader = document.getElementById('loader');
    const nenhumResultadoMsg = document.getElementById('nenhum-resultado');

    // --- FUNÇÕES DA API ---

    async function buscarPratos(query) {
        mostrarLoader(true);
        pratosGrid.innerHTML = ''; // Limpa a grade antes de nova busca
        nenhumResultadoMsg.classList.add('hidden');
        try {
            const response = await fetch(`${API_URL_SEARCH}${query}`);
            const data = await response.json();
            mostrarLoader(false);
            if (data.meals) {
                renderizarPratos(data.meals);
            } else {
                nenhumResultadoMsg.classList.remove('hidden');
            }
        } catch (error) {
            mostrarLoader(false);
            console.error("Erro ao buscar pratos:", error);
            nenhumResultadoMsg.textContent = "Ocorreu um erro ao buscar. Tente novamente.";
            nenhumResultadoMsg.classList.remove('hidden');
        }
    }

    async function buscarDetalhesPrato(pratoId) {
        mostrarLoader(true);
        try {
            const response = await fetch(`${API_URL_LOOKUP}${pratoId}`);
            const data = await response.json();
            mostrarLoader(false);
            if (data.meals && data.meals.length > 0) {
                return data.meals[0];
            }
        } catch (error) {
            mostrarLoader(false);
            console.error("Erro ao buscar detalhes do prato:", error);
        }
        return null;
    }


    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderizarPratos(pratos) {
        pratosGrid.innerHTML = '';
        pratos.forEach(prato => {
            const card = document.createElement('div');
            card.className = 'prato-card';
            card.dataset.id = prato.idMeal;
            card.innerHTML = `
                <img src="${prato.strMealThumb}" alt="[Imagem de ${prato.strMeal}]" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f8f9fa/e74c3c?text=Imagem+Indisponível';">
                <div class="info">
                    <h3>${prato.strMeal}</h3>
                </div>
            `;
            card.addEventListener('click', () => mostrarDetalhesView(prato.idMeal));
            pratosGrid.appendChild(card);
        });
    }

    // NOVA FUNÇÃO para anexar pratos sem limpar a grade
    function renderizarEAnexarPratos(pratos) {
        if (!pratos) return;
        pratos.forEach(prato => {
            const card = document.createElement('div');
            card.className = 'prato-card';
            card.dataset.id = prato.idMeal;
            card.innerHTML = `
                <img src="${prato.strMealThumb}" alt="[Imagem de ${prato.strMeal}]" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f8f9fa/e74c3c?text=Imagem+Indisponível';">
                <div class="info">
                    <h3>${prato.strMeal}</h3>
                </div>
            `;
            card.addEventListener('click', () => mostrarDetalhesView(prato.idMeal));
            pratosGrid.appendChild(card);
        });
    }

    function renderizarDetalhes(prato) {
        // --- Header ---
        detalhesHeaderContainer.innerHTML = `
            <div class="detalhes-header">
                <div class="header-top">
                    <button class="btn-voltar" id="btn-voltar"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
                </div>
                <div class="header-main">
                    <img src="${prato.strMealThumb}" alt="[Imagem de ${prato.strMeal}]" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f8f9fa/e74c3c?text=Imagem+Indisponível';">
                    <div class="detalhes-header-info">
                        <h2>${prato.strMeal}</h2>
                        <p>${prato.strCategory} &bull; ${prato.strArea}</p>
                    </div>
                </div>
            </div>
        `;

        // --- Ingredientes ---
        let ingredientesHTML = '<h3><i class="fa-solid fa-list-check"></i> Ingredientes</h3><ul class="ingredientes-lista">';
        for (let i = 1; i <= 20; i++) {
            const ingrediente = prato[`strIngredient${i}`];
            const medida = prato[`strMeasure${i}`];
            if (ingrediente && ingrediente.trim() !== '') {
                ingredientesHTML += `<li><strong>${ingrediente}:</strong> ${medida}</li>`;
            }
        }
        ingredientesHTML += '</ul>';

        // --- Instruções ---
        const instrucoesHTML = `
            <h3><i class="fa-solid fa-book-open"></i> Modo de Preparo</h3>
            <p class="instrucoes">${prato.strInstructions}</p>
        `;

        // --- Preço (Simulado) e Botão Adicionar ---
        // Gera um preço aleatório "realista" entre 15.00 e 75.00
        const precoSimulado = (Math.random() * (75 - 15) + 15).toFixed(2);
        prato.preco = parseFloat(precoSimulado); // Adiciona o preço ao objeto para usar no carrinho

        const acaoHTML = `
            <div class="detalhes-acao">
                <span class="prato-preco">R$ ${precoSimulado.replace('.', ',')}</span>
                <button class="btn-adicionar" data-item-id="${prato.idMeal}">Adicionar</button>
            </div>
        `;
        
        detalhesContent.innerHTML = ingredientesHTML + instrucoesHTML + acaoHTML;

        // Adiciona listeners aos botões criados dinamicamente
        document.getElementById('btn-voltar').addEventListener('click', mostrarPratosView);
        detalhesContent.querySelector('.btn-adicionar').addEventListener('click', () => {
             adicionarAoCarrinho(prato);
        });
    }
    
    function renderizarCarrinho() {
        carrinhoItensContainer.innerHTML = '';
        if (carrinho.length === 0) {
            carrinhoItensContainer.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio.</p>`;
            carrinhoTotalContainer.innerHTML = '';
            btnFinalizar.classList.add('hidden');
        } else {
             btnFinalizar.classList.remove('hidden');
             carrinho.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'carrinho-item';
                itemDiv.innerHTML = `
                    <div class="carrinho-item-info">
                        <span>${item.quantidade}x ${item.nome}</span>
                        <small>R$ ${item.preco.toFixed(2).replace('.', ',')}</small>
                    </div>
                    <span>R$ ${(item.quantidade * item.preco).toFixed(2).replace('.', ',')}</span>
                `;
                carrinhoItensContainer.appendChild(itemDiv);
            });

            const total = carrinho.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
            carrinhoTotalContainer.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2).replace('.', ',')}`;
        }

        const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        if (totalItens > 0) {
            carrinhoContador.textContent = totalItens;
            carrinhoContador.classList.remove('hidden');
        } else {
            carrinhoContador.classList.add('hidden');
        }
    }


    // --- FUNÇÕES DE LÓGICA E CONTROLE DE VIEW ---

    async function mostrarDetalhesView(pratoId) {
        const prato = await buscarDetalhesPrato(pratoId);
        if (prato) {
            renderizarDetalhes(prato);
            pratosView.classList.add('hidden');
            detalhesView.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    }

    function mostrarPratosView() {
        detalhesView.classList.add('hidden');
        pratosView.classList.remove('hidden');
    }
    
    function adicionarAoCarrinho(prato) {
         const itemNoCarrinho = carrinho.find(item => item.id === prato.idMeal);

         if (itemNoCarrinho) {
             itemNoCarrinho.quantidade++;
         } else {
             carrinho.push({ 
                 id: prato.idMeal,
                 nome: prato.strMeal,
                 preco: prato.preco, // O preço simulado foi adicionado ao objeto prato
                 quantidade: 1 
            });
         }
         
         renderizarCarrinho();
         // Animação rápida no botão do carrinho
         carrinhoBtnAbrir.style.transform = 'scale(1.2)';
         setTimeout(() => {
            carrinhoBtnAbrir.style.transform = 'scale(1)';
         }, 200);
    }
    
    function toggleCarrinhoModal() {
        carrinhoModalOverlay.classList.toggle('hidden');
    }

    function finalizarPedido() {
        if(carrinho.length === 0) return;
        
        alert('Pedido finalizado com sucesso!)');
        carrinho = [];
        renderizarCarrinho();
        toggleCarrinhoModal();
    }
    
    function mostrarLoader(visivel) {
        if(visivel) {
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    }

    // --- EVENT LISTENERS ---
    
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if(query) {
            buscarPratos(query);
        }
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                buscarPratos(query);
            }
        }
    });

    carrinhoBtnAbrir.addEventListener('click', toggleCarrinhoModal);
    carrinhoBtnFechar.addEventListener('click', toggleCarrinhoModal);
    carrinhoModalOverlay.addEventListener('click', (e) => {
        if(e.target === carrinhoModalOverlay) {
            toggleCarrinhoModal();
        }
    });
    btnFinalizar.addEventListener('click', finalizarPedido);
    
    // --- INICIALIZAÇÃO ---
    async function carregarPratosIniciais() {
        mostrarLoader(true);
        pratosGrid.innerHTML = ''; // Limpa a grade antes de carregar os pratos iniciais
        nenhumResultadoMsg.classList.add('hidden');

        // Adiciona uma variedade de categorias na página inicial
        const categorias = ["Chicken", "Pasta", "Seafood", "Dessert", "Vegetarian"];
        
        for (const categoria of categorias) {
            try {
                const response = await fetch(`${API_URL_SEARCH}${categoria}`);
                const data = await response.json();
                if (data.meals) {
                    // Limita a quantidade de pratos por categoria para a página inicial não ficar muito grande
                    renderizarEAnexarPratos(data.meals.slice(0, 4));
                }
            } catch (error) {
                console.error(`Erro ao buscar a categoria ${categoria}:`, error);
            }
        }
        
        mostrarLoader(false);
        // Mostra mensagem de erro apenas se nenhum prato for carregado
        if (pratosGrid.children.length === 0) {
            nenhumResultadoMsg.textContent = "Não foi possível carregar os pratos. Tente novamente mais tarde.";
            nenhumResultadoMsg.classList.remove('hidden');
        }
    }

    function init() {
        carregarPratosIniciais();
        renderizarCarrinho();
    }

    init();
});
