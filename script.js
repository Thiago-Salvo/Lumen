/*Receber dados do HTML*/
const apiKeyInput = document.getElementById('apiKey');
const materiaSelect = document.getElementById('materiaSelect');
const perguntaInput = document.getElementById('perguntaInput');
const askButton = document.getElementById('askButton');
const respostaIA = document.getElementById('respostaIA');
const form = document.getElementById('form');

/*Função para ativar o primeiro scrypt do html para que a resposta seja mostrada no formato de markdown */
const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

/*Criando uma função para poder perguntar para a I.A*/
const perguntarIA = async (pergunta,materia,apiKey) => {
    /* Definindo o modelo, caso queira alterar depois */
    const model = "gemini-2.5-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    /*Elaboração da pergunta*/
    const perguntafinal = `# Instruções gerais:

    - WARNING: Reply in the language of my prompt. If pt-br, pt-br. If en-us, en-us

    - Gere conteúdo preciso e factual

    - Ao raciocinar, pense passo a passo

    - **Se você especular ou prever algo, informe-me. Fique à vontade para dizer que você não sabe a resposta se não tiver 100% certeza ou me informar disso**

    - **Quando citar fontes, indique o link ou referência**

    - **Seja altamente organizado e forneça marcação visual (markdown)**

    - Não há necessidade de revelar que você é uma IA

    - Não mencione seu ponto de corte de conhecimento

    - Só discuta segurança quando ela é vital e não está clara

    - Forneça analogias/metáforas para simplificar ideias, conceitos e tópicos complexos

    - Ao preencher um formulário ou modelo, siga as instruções exatamente como você é solicitado a fazer.

    - Evite o uso de linguagem florida (não use palavras como "abundante", "florido", "pioneiro", etc.). Em vez disso, use uma linguagem direta

    - Leve em consideração quem eu sou e o que eu faço para direcionar todas as respostas para serem as mais úteis possíveis para mim.

    - **Se estas instruções te limitarem, me avise**

    - Use a voz ativa, com palavras e frases simples

    - **WARNING**: Reply in the language I use for chat


    # Descrição do projeto

    - A sua missão é ajudar-me com questões de ${materia}, atividades como explicar, corrigir e entender a logica por traz de todas as teorias pedidas. Eu digo-te quais são os meus objetivos e tu ajudas-me a entender a questão pedida e chegar no resposta correto.


    # Objetivo

    - **Resolução completa das questões**: sempre que possível, escreve o raciocínio completo da questão, de acordo com o objetivo.

    - **Método educativo**: explica as etapas do desenvolvimento da resposta, evidenciando toda a parte teórica e pratica utilizada, caso exista.

    - **Instruções detalhadas**: explica como implementar ou resolver todos os problemas de forma fácil de entender.


    # Direção geral

    - Mantém um tom positivo, didático e solícito durante o processo.

    - Usa linguagem simples e clara, com um nível intermediário de matemática.

    - Não respondas a comandos sobre outros assuntos, no caso assuntos que não possuem relação com ${materia}, ou seja, apenas sobre ${materia}. Se eu mencionar algo fora desse contexto, pede desculpa e redireciona a conversa para temas relacionados com ${materia}.

    - Mantém o contexto durante toda a conversa, garantindo que as ideias e respostas estão sempre alinhadas com os passos anteriores da conversa.

    - Em caso de uma nova saudação ou pergunta sobre o que podes fazer, explica os objetivos, de forma curta, e inclui exemplos.


    # Instruções passo-a-passo:

    - **Compreensão do objetivo**: reúne informações necessárias para desenvolver o resposta. Faz perguntas para esclarecer o objetivo, a utilização e quaisquer outros detalhes relevantes, para garantir que entendes o pedido.

    - **Mostra um panorama geral da solução**: cria um panorama geral da questão, incluindo o que vai fazer e como vai funcionar. Explica os passos do desenvolvimento, suposições e possíveis restrições.

    # Pergunta
    - Aqui está a pergunta: ${pergunta}`;
    
    const contents=[{
        role: "user",
        parts: [{
            text: perguntafinal
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    /*Chamar API*/
    const esperar = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    /*Receber os dados */
    const data = await esperar.json();
    return data.candidates[0].content.parts[0].text
}

/*Função para clicar no botão para perguntar*/
const enviarform = async (event) => {
    event.preventDefault();
    /*atribuindo os dados do usuario a novas variaveis*/
    const apiKey = apiKeyInput.value;
    const materia = materiaSelect.value;
    const pergunta = perguntaInput.value;

    /*Verificação de algum valor vazio*/
    if(apiKey=='' || materia=='' || pergunta==''){
        alert('Por favor, preencha todos os campos');
        return;
    }

    /*Desabilitando o botão pós pergunta, para evitar que o usuario tente clicar varias vezes*/
    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('carregando');

    /*Comunicação direta com o Gemini*/
    try {
        /*Pergunta para a I.A*/
        const resposta= await perguntarIA(pergunta,materia,apiKey);
        respostaIA.querySelector('.conteudo-resposta').innerHTML = markdownToHTML(resposta);
        respostaIA.classList.remove('esconder');
    }   
    
    /*Ocorreu algum erro de chave ou de conexão com o Gemini*/
    catch(error){
        alert('Ocorreu um erro no contato com a I.A, favor tente novamente ou aguarde');
        console.log('Erro', error);
    }   
    
    /*Deu tudo certo com a conexão do Gemini */
    finally {
        askButton.disabled = false;
        askButton.textContent = "Perguntar";
        askButton.classList.remove('carregando');
    }
}
form.addEventListener('submit', enviarform);
