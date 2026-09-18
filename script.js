document.addEventListener('DOMContentLoaded', () => {
  console.log('[PORTFÓLIO BACK-END] Aplicação carregada com sucesso em JavaScript puro.');

  // ============================================================================
  // 1. MENU MOBILE (ABERTURA E FECHAMENTO RESPONSIVO EM SMARTPHONES)
  // ============================================================================
  const btnMenuHamburguer = document.getElementById('btn-menu-hamburguer');
  const menuMobile = document.getElementById('menu-mobile');

  if (btnMenuHamburguer && menuMobile) {
    btnMenuHamburguer.addEventListener('click', () => {
      menuMobile.classList.toggle('ativo');
    });

    const linksMobile = menuMobile.querySelectorAll('a');
    linksMobile.forEach((link) => {
      link.addEventListener('click', () => {
        menuMobile.classList.remove('ativo');
      });
    });
  }

  // ============================================================================
  // 2. ILUSTRAÇÃO VISUAL DE ARQUITETURA BACK-END (HERO)
  // ============================================================================
  // A seção hero exibe a ilustração conceitual de infraestrutura e serviços back-end.

  // ============================================================================
  // 3. PROMPT / MODAL DE DETALHES COMPLETOS DO PROJETO BACK-END
  // ============================================================================
  const modalProjeto = document.getElementById('modal-projeto');

  // Repositório didático de trechos de arquitetura Back-End com base nos 3 projetos dos READMEs anexados
  const codigosProjetos = {
    visaoLab: {
      titulo: 'VisãoLab — Processador de Imagens & Visão Computacional',
      badge: 'Python 3.9+ • OpenCV 4.10 • Flask 3.0 • JavaScript Vanilla',
      descricao: 'Aplicação Web Full-Stack para processamento de imagens e visão computacional em tempo real. Implementa pipelines matemáticos clássicos de desenho a lápis com textura realista de grafite (Color Dodge), detecção facial com classificadores Haar Cascade e demarcação de caixas táticas delimitadoras, detector de contornos (Canny Edges) e quantização cartoon, com backend Flask e métricas de latência em milissegundos.',
      regras: [
        'Algoritmo Color Dodge para Desenho a Lápis: pipeline matricial com Escala de Cinza (Y = 0.299R + 0.587G + 0.114B), inversão (255 - Y), filtro Gaussiano seletivo (Kernel 21x21) e divisão escalar acelerada via cv2.divide.',
        'Detecção Facial com Haar Cascade: utiliza o modelo pré-treinado haarcascade_frontalface_default.xml em escala cinza para detectar características faciais em múltiplas escalas (scaleFactor=1.15, minNeighbors=5) com bounding boxes táticas e contagem de faces.',
        'Detecção de Contornos Canny & Efeito Cartoon: extração de arestas estruturais e geometria por gradiente de histerese e quantização de cores adaptativa.',
        'Métricas de Performance em Tempo Real: medição de latência de processamento por imagem (ms), resolução e contagem de faces retornadas via JSON com imagem em Base64.',
        'Arquitetura Headless e Leve: utilização de opencv-python-headless no backend para servidores e contêineres sem dependências de display X11.'
      ],
      endpoints: [
        { metodo: 'POST', caminho: '/api/process', desc: 'Recebe imagem (multipart/form-data), aplica pipeline OpenCV e retorna Base64 com métricas de tempo' },
        { metodo: 'GET', caminho: '/api/health', desc: 'Health check de integridade do serviço, versão do OpenCV instalada e efeitos suportados' }
      ],
      tags: ['Python 3.9+', 'OpenCV 4.10 (cv2)', 'Flask 3.0', 'NumPy', 'Visão Computacional', 'Haar Cascade', 'API REST', 'JavaScript Vanilla', 'HTML5/CSS3'],
      arquivoCodigo: 'app.py (Pipeline OpenCV & Color Dodge)',
      linkGithub: 'https://github.com/AntonyMat/OpenCV-VisionLab',
      codigo: `/**
 * ARQUITETURA DE VISÃO COMPUTACIONAL: PIPELINE OPENCV & COLOR DODGE
 * Projeto: VisãoLab — Processador de Imagens com OpenCV & Python
 * Autor: Antony Costa / Antony Alves (Engenharia de Software & Visão Computacional)
 * 
 * OBJETIVO DIDÁTICO:
 * Demonstrar a aplicação prática de transformações matriciais com OpenCV (cv2)
 * e NumPy no backend Flask. O algoritmo Color Dodge simula o efeito realista
 * de desenho a lápis através de convolução gaussiana e divisão escalar vetorizada.
 */

import cv2
import numpy as np
from flask import Flask, request, jsonify
import time

app = Flask(__name__)

# Carregamento do classificador Haar Cascade pré-treinado para faces
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

def processar_desenho_lapis(img_bgr, ksize=21):
    """
    Pipeline Matemático Color Dodge:
    1. Escala de Cinza: Y = 0.299R + 0.587G + 0.114B
    2. Inversão dos tons: 255 - Y
    3. Filtro Gaussiano (Kernel 21x21) para suavização seletiva
    4. Divisão Color Dodge: (Cinza * 256) / (256 - Blur)
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    inverted = 255 - gray
    blurred = cv2.GaussianBlur(inverted, (ksize, ksize), sigmaX=0, sigmaY=0)
    sketch = cv2.divide(gray, 255 - blurred, scale=256.0)
    return sketch

def detectar_faces(img_bgr):
    """
    Detecção facial com Haar Cascade em múltiplas escalas.
    Demarca caixas delimitadoras e conta os rostos detectados.
    """
    img_resultado = img_bgr.copy()
    gray = cv2.cvtColor(img_resultado, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray, 
        scaleFactor=1.15, 
        minNeighbors=5, 
        minSize=(30, 30)
    )
    
    for idx, (x, y, w, h) in enumerate(faces, start=1):
        # Bounding box tática (Verde neon BGR: 0, 255, 128)
        cv2.rectangle(img_resultado, (x, y), (x + w, y + h), (128, 255, 0), 2)
        cv2.putText(
            img_resultado, f"Face #{idx}", (x, y - 8),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 255, 0), 2
        )
        
    return img_resultado, len(faces)

@app.route('/api/process', methods=['POST'])
def api_process():
    inicio = time.time()
    arquivo = request.files.get('image')
    efeito = request.form.get('effect', 'sketch')
    
    if not arquivo:
        return jsonify({"success": False, "error": "Nenhuma imagem enviada"}), 400

    img_array = np.frombuffer(arquivo.read(), np.uint8)
    img_bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    
    faces_encontradas = None
    if efeito == 'sketch':
        resultado = processar_desenho_lapis(img_bgr)
    elif efeito == 'faces':
        resultado, faces_encontradas = detectar_faces(img_bgr)
    elif efeito == 'canny':
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        resultado = cv2.Canny(gray, 100, 200)
    else:
        resultado = img_bgr
        
    tempo_ms = round((time.time() - inicio) * 1000, 2)
    return jsonify({
        "success": True,
        "effect_applied": efeito,
        "metadata": {
            "processing_time_ms": tempo_ms,
            "faces_detected": faces_encontradas,
            "opencv_version": cv2.__version__
        }
    })`
    },

    telemetria: {
      titulo: 'API de Telemetria e Diagnóstico de Dispositivos',
      badge: 'Java 17 • Spring Boot 3 + Netty • MongoDB 7 • RabbitMQ • Docker',
      descricao: 'API Reativa não-bloqueante desenvolvida para ingestão e diagnóstico em tempo real de telemetria de hardware Android (CPU, temperatura, bateria e memória). Utiliza arquitetura assíncrona orientada a eventos com Spring WebFlux e Netty, mensageria via RabbitMQ (AMQP), detecção em tempo real de thermal throttling (> 75°C), persistência de séries temporais no MongoDB 7.0 e suíte de testes compatível com Postman v2.1.',
      regras: [
        'Ingestão Assíncrona Não-Bloqueante: endpoint de alta vazão responde imediatamente com HTTP 202 Accepted e encaminha o payload para a fila de mensagens sem travar o event loop do Netty.',
        'Detecção Automática de Thermal Throttling: monitoramento contínuo da temperatura de hardware; picos térmicos acima de 75°C disparam alertas críticos imediatos no banco de dados.',
        'Stream Reativo de Telemetria: endpoint (/api/v1/telemetry/stream) para streaming contínuo de métricas dos dispositivos em tempo real.',
        'Persistência em Séries Temporais com MongoDB: persistência de histórico e telemetrias estruturadas por deviceId com alta taxa de escrita.',
        'Arquitetura em Contêineres Docker Compose: orquestração multi-serviço contendo MongoDB 7.0 (porta 27017), RabbitMQ 3.13 (AMQP 5672 e painel 15672) e API Reativa (porta 8080).',
        'Homologação via Postman v2.1 & Actuator: exportação nativa de coleção com health check Spring Boot Actuator e cenários de carga.'
      ],
      endpoints: [
        { metodo: 'POST', caminho: '/api/v1/telemetry', desc: 'Ingestão assíncrona não-bloqueante de telemetria (retorna HTTP 202 Accepted)' },
        { metodo: 'GET', caminho: '/api/v1/telemetry/alerts', desc: 'Lista alertas de temperatura crítica (> 75°C) de superaquecimento' },
        { metodo: 'GET', caminho: '/api/v1/telemetry/device/:deviceId', desc: 'Histórico completo de métricas de telemetria do dispositivo' },
        { metodo: 'GET', caminho: '/api/v1/telemetry/stream', desc: 'Stream reativo contínuo de métricas em tempo real' },
        { metodo: 'GET', caminho: '/actuator/health', desc: 'Health check do serviço compatível com Spring Boot Actuator' }
      ],
      tags: ['Java 17', 'Spring Boot 3', 'Spring WebFlux', 'Netty', 'MongoDB 7.0', 'RabbitMQ (AMQP)', 'Docker Compose', 'Postman v2.1', 'Spring Boot Actuator'],
      arquivoCodigo: 'TelemetryDiagnosticService.java (Reativo & Event-Driven)',
      linkGithub: 'https://github.com/AntonyMat/API-de-Telemetria-e-Diagn-stico-de-Dispositivos',
      codigo: `/**
 * ARQUITETURA REATIVA: INGESTÃO DE TELEMETRIA & DIAGNÓSTICO DE HARDWARE
 * Projeto: API de Telemetria e Diagnóstico de Dispositivos
 * Autor: Antony Alves (Engenharia Back-End & Sistemas Reativos)
 * 
 * OBJETIVO DIDÁTICO:
 * Processamento assíncrono e não-bloqueante de telemetria Android via RabbitMQ e MongoDB.
 * Detecta instantaneamente thermal throttling quando a temperatura da CPU ultrapassa 75°C,
 * persistindo alertas críticos sem bloquear o throughput de ingestão do Netty.
 */

package com.antonyalves.telemetry.service;

import com.antonyalves.telemetry.model.DeviceTelemetry;
import com.antonyalves.telemetry.model.ThermalAlert;
import com.antonyalves.telemetry.repository.DeviceTelemetryRepository;
import com.antonyalves.telemetry.repository.ThermalAlertRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.logging.Logger;

@Service
public class TelemetryDiagnosticService {

    private static final Logger log = Logger.getLogger(TelemetryDiagnosticService.class.getName());
    private static final double LIMIAR_TEMPERATURA_CRITICA = 75.0; // °C

    private final DeviceTelemetryRepository telemetryRepository;
    private final ThermalAlertRepository alertRepository;

    public TelemetryDiagnosticService(DeviceTelemetryRepository telemetryRepository, 
                                      ThermalAlertRepository alertRepository) {
        this.telemetryRepository = telemetryRepository;
        this.alertRepository = alertRepository;
    }

    /**
     * CONSUMIDOR REATIVO DA FILA DE TELEMETRIA (AMQP - RabbitMQ)
     * Ingestão desacoplada: a API respondeu HTTP 202 Accepted na borda;
     * este listener processa o diagnóstico de hardware em background.
     */
    @RabbitListener(queues = "\${telemetry.queue.name:telemetry-ingestion-queue}")
    public void processarTelemetria(DeviceTelemetry payload) {
        payload.setRecebidoEm(Instant.now());

        // 1. Persistência da série temporal no MongoDB 7.0
        telemetryRepository.save(payload)
            .doOnSuccess(saved -> log.info("[TELEMETRIA] Registrada para device: " + saved.getDeviceId()))
            .subscribe();

        // 2. Regra de Negócio: Detecção de Thermal Throttling / Superaquecimento
        if (payload.getCpuTemperature() > LIMIAR_TEMPERATURA_CRITICA) {
            ThermalAlert alerta = new ThermalAlert();
            alerta.setDeviceId(payload.getDeviceId());
            alerta.setTemperaturaRegistrada(payload.getCpuTemperature());
            alerta.setNivelGravidade("CRITICAL");
            alerta.setTimestamp(Instant.now());
            alerta.setMensagem(String.format(
                "Superaquecimento detectado no hardware Android (%s). Temperatura: %.1f°C > Limiar 75°C",
                payload.getDeviceModel(), payload.getCpuTemperature()
            ));

            // Persistência imediata do alerta crítico
            alertRepository.save(alerta)
                .doOnSuccess(alt -> log.warning("[ALERTA TÉRMICO CRÍTICO] " + alt.getMensagem()))
                .subscribe();
        }
    }
}`
    },

    estudosApi: {
      titulo: 'Estudos & Simulados API — Spring Boot 3 & JWT',
      badge: 'Java 17 • Spring Boot 3.2 • Spring Security (JWT) • PostgreSQL 16 • Swagger',
      descricao: 'API RESTful completa desenvolvida com Java 17, Spring Boot 3.2, Spring Security com tokens JWT (HMAC-256), Spring Data JPA e PostgreSQL 16. Desenvolvida para gerenciamento de cronograma de estudos, métricas de simulados e correção de redações com cálculo automatizado das 5 competências do ENEM (0 a 1000 pontos). Aplica isolamento multilocatário rigoroso por estudante (Tenant per User), paginação eficiente com Pageable, documentação interativa Swagger/OpenAPI 3 e testes unitários com JUnit 5 + Mockito.',
      regras: [
        'Autenticação Stateless com JWT: token emitido após login, assinado com HMAC-256 e interceptado via OncePerRequestFilter (SecurityFilter e SecurityConfigurations).',
        'Isolamento Multilocatário (Tenant per User): cada estudante autenticado acessa exclusivamente seus próprios registros; o usuarioId é extraído com segurança via @AuthenticationPrincipal e validado em cada operação.',
        'Cálculo de Regra de Negócio de Redação (ENEM): soma automatizada das notas das 5 competências (0 a 200 pontos cada, somando até 1000), encapsulado diretamente na entidade rica de domínio.',
        'Paginação Eficiente com Spring Data: endpoints de listagem paginados via interface Pageable (/redacoes?page=0&size=10) para controle de latência e consumo de memória.',
        'Documentação Interativa Swagger / OpenAPI 3: documentação completa em /swagger-ui.html com suporte integrado para inserção de Bearer Token.',
        'Cobertura de Testes com JUnit 5 & Mockito: suíte automatizada validando regras de negócio, cálculos de notas e isolamento de locatários.'
      ],
      endpoints: [
        { metodo: 'POST', caminho: '/auth/register', desc: 'Cadastra novo estudante com criptografia de senha via BCrypt' },
        { metodo: 'POST', caminho: '/auth/login', desc: 'Autentica estudante e emite Token JWT assinado (HMAC-256)' },
        { metodo: 'POST', caminho: '/redacoes', desc: 'Cadastra redação com 5 competências e calcula nota total automaticamente' },
        { metodo: 'GET', caminho: '/redacoes?page=0&size=10', desc: 'Lista paginada das redações pertencentes unicamente ao estudante autenticado' },
        { metodo: 'GET', caminho: '/redacoes/{id}', desc: 'Consulta redação por ID com validação de posse do registro' },
        { metodo: 'DELETE', caminho: '/redacoes/{id}', desc: 'Exclui redação pertencente exclusivamente ao usuário logado' }
      ],
      tags: ['Java 17', 'Spring Boot 3.2', 'Spring Security', 'JWT (HMAC-256)', 'PostgreSQL 16', 'Spring Data JPA', 'Swagger / OpenAPI 3', 'JUnit 5', 'Mockito', 'Docker Compose'],
      arquivoCodigo: 'RedacaoService.java (Regra de Negócio & Tenant Isolation)',
      linkGithub: 'https://github.com/AntonyMat/API-de-Gerenciamento-de-Estudos-e-Simulados',
      codigo: `/**
 * ARQUITETURA BACK-END: REGRA DE NEGÓCIO & ISOLAMENTO MULTILOCATÁRIO
 * Projeto: Estudos & Simulados API
 * Autor: Antony Alves (Desenvolvedor Back-End Java)
 * 
 * OBJETIVO DIDÁTICO:
 * Demonstrar o encapsulamento de regras de negócio (cálculo das 5 competências ENEM)
 * e a garantia de isolamento por estudante (Tenant per User) via Spring Security e JPA.
 */

package com.estudos.api.domain.service;

import com.estudos.api.domain.dto.RedacaoRequestDTO;
import com.estudos.api.domain.dto.RedacaoResponseDTO;
import com.estudos.api.domain.model.Redacao;
import com.estudos.api.domain.model.Usuario;
import com.estudos.api.domain.repository.RedacaoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RedacaoService {

    private final RedacaoRepository redacaoRepository;

    public RedacaoService(RedacaoRepository redacaoRepository) {
        this.redacaoRepository = redacaoRepository;
    }

    /**
     * CADASTRO DE REDAÇÃO COM CÁLCULO AUTOMÁTICO DE NOTA TOTAL
     * - Soma as notas das 5 competências do ENEM (0 a 200 cada)
     * - Vincula a redação exclusivamente ao estudante autenticado via JWT
     */
    @Transactional
    public RedacaoResponseDTO cadastrar(RedacaoRequestDTO dados, Usuario usuarioLogado) {
        Redacao redacao = new Redacao();
        redacao.setTema(dados.tema());
        redacao.setCompetencia1(dados.competencia1());
        redacao.setCompetencia2(dados.competencia2());
        redacao.setCompetencia3(dados.competencia3());
        redacao.setCompetencia4(dados.competencia4());
        redacao.setCompetencia5(dados.competencia5());
        
        // Regra de Domínio: Cálculo automatizado da nota total (0 a 1000 pontos)
        redacao.calcularNotaTotal();
        
        // Isolamento de Locatário (Tenant per User)
        redacao.setUsuario(usuarioLogado);

        Redacao salva = redacaoRepository.save(redacao);
        return new RedacaoResponseDTO(salva);
    }

    /**
     * CONSULTA COM VALIDAÇÃO DE POSSE DO REGISTRO
     * Impede que um estudante visualize dados de outro usuário
     */
    @Transactional(readOnly = true)
    public RedacaoResponseDTO buscarPorId(Long id, Usuario usuarioLogado) {
        Redacao redacao = redacaoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Redação não encontrada. ID: " + id));

        // Validação de Segurança Multilocatário
        if (!redacao.getUsuario().getId().equals(usuarioLogado.getId())) {
            throw new AccessDeniedException("Acesso negado: o registro solicitado pertence a outro usuário.");
        }

        return new RedacaoResponseDTO(redacao);
    }

    /**
     * LISTAGEM PAGINADA ISOLADA POR ESTUDANTE
     */
    @Transactional(readOnly = true)
    public Page<RedacaoResponseDTO> listarPorUsuario(Usuario usuarioLogado, Pageable paginacao) {
        return redacaoRepository.findAllByUsuarioId(usuarioLogado.getId(), paginacao)
            .map(RedacaoResponseDTO::new);
    }
}`
    }
  };

  /**
   * Abre o prompt modal com todas as informações e arquitetura do projeto selecionado
   */
  function abrirPromptProjeto(chave) {
    const dados = codigosProjetos[chave];
    if (!dados || !modalProjeto) return;

    const elTitulo = document.getElementById('modal-projeto-titulo');
    const elBadge = document.getElementById('modal-projeto-badge');
    const elDesc = document.getElementById('modal-projeto-descricao');
    const elRegras = document.getElementById('modal-projeto-regras');
    const elRotas = document.getElementById('modal-projeto-rotas');
    const elTags = document.getElementById('modal-projeto-tags');
    const elArquivo = document.getElementById('modal-projeto-arquivo');
    const elPre = document.getElementById('modal-codigo-pre');
    const elBtnGithub = document.getElementById('modal-projeto-btn-github');

    if (elTitulo) elTitulo.textContent = dados.titulo;
    if (elBadge) elBadge.textContent = dados.badge;
    if (elDesc) elDesc.textContent = dados.descricao;
    if (elArquivo) elArquivo.textContent = dados.arquivoCodigo || 'Service.java';
    if (elPre) elPre.textContent = dados.codigo;
    if (elBtnGithub) elBtnGithub.href = dados.linkGithub || 'https://github.com/AntonyMat';

    // Lista de Regras de Negócio e Arquitetura
    if (elRegras && dados.regras) {
      elRegras.innerHTML = '';
      dados.regras.forEach((regra) => {
        const li = document.createElement('li');
        li.textContent = regra;
        elRegras.appendChild(li);
      });
    }

    // Endpoints e Rotas da API
    if (elRotas && dados.endpoints) {
      elRotas.innerHTML = '';
      dados.endpoints.forEach((ep) => {
        const item = document.createElement('div');
        item.className = 'modal-rota-item';

        let metodoClasse = 'metodo-get';
        const m = ep.metodo.toUpperCase();
        if (m.includes('POST')) metodoClasse = 'metodo-post';
        else if (m.includes('PUT')) metodoClasse = 'metodo-put';
        else if (m.includes('DELETE')) metodoClasse = 'metodo-delete';
        else if (m.includes('400') || m.includes('404') || m.includes('409') || m.includes('500')) metodoClasse = 'metodo-delete';

        item.innerHTML = `
          <span class="metodo-badge ${metodoClasse}">${ep.metodo}</span>
          <span class="modal-rota-caminho">${ep.caminho}</span>
          <span class="modal-rota-desc">${ep.desc}</span>
        `;
        elRotas.appendChild(item);
      });
    }

    // Tags de Tecnologias
    if (elTags && dados.tags) {
      elTags.innerHTML = '';
      dados.tags.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'tag-stack';
        span.textContent = tag;
        elTags.appendChild(span);
      });
    }

    abrirModalUnico(modalProjeto);
  }

  // 1. Clique na janela do projeto (card compacto inteiro abre o prompt)
  const cardsProjetos = document.querySelectorAll('.projeto-card-compacto');
  cardsProjetos.forEach((card) => {
    const projetoKey = card.getAttribute('data-projeto');
    if (!projetoKey) return;

    card.addEventListener('click', (evento) => {
      // Se clicou no link externo do GitHub, deixa navegar sem abrir o modal
      if (evento.target.closest('.btn-github-projeto') || evento.target.closest('.projeto-link-github-icone')) {
        return;
      }
      abrirPromptProjeto(projetoKey);
    });

    // Acessibilidade via teclado (Enter ou Barra de Espaço)
    card.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        if (evento.target.closest('.btn-github-projeto') || evento.target.closest('.projeto-link-github-icone')) {
          return;
        }
        evento.preventDefault();
        abrirPromptProjeto(projetoKey);
      }
    });
  });

  // 2. Clique nos botões explícitos "Mais Informações" ou botões legados de código
  const botoesAbrirPrompt = document.querySelectorAll('.btn-abrir-prompt-projeto, .btn-abrir-codigo');
  botoesAbrirPrompt.forEach((botao) => {
    botao.addEventListener('click', (evento) => {
      evento.stopPropagation();
      const projetoKey = botao.getAttribute('data-projeto');
      if (projetoKey) {
        abrirPromptProjeto(projetoKey);
      }
    });
  });

  // ============================================================================
  // 4. MODAL DE CURRÍCULO PROFISSIONAL (CV) — VISUALIZAR E IMPRIMIR EM PDF
  // ============================================================================
  const modalCv = document.getElementById('modal-cv');
  const botoesAbrirCv = document.querySelectorAll('.btn-abrir-cv');
  const btnImprimirCv = document.getElementById('btn-imprimir-cv');

  function abrirModalUnico(modal) {
    [modalProjeto, modalCv, modalEmail].forEach((modalAtivo) => {
      if (modalAtivo && modalAtivo !== modal) {
        modalAtivo.classList.remove('ativo');
      }
    });

    if (modal) {
      modal.classList.add('ativo');
    }
  }

  // Abre o modal de currículo ao clicar em qualquer botão com a classe .btn-abrir-cv
  botoesAbrirCv.forEach((botao) => {
    botao.addEventListener('click', () => {
      abrirModalUnico(modalCv);
    });
  });

  // Dispara a impressão do navegador para gerar PDF limpo e formatado do CV
  if (btnImprimirCv) {
    btnImprimirCv.addEventListener('click', () => {
      window.print();
    });
  }

  // ============================================================================
  // 5. MODAL DE OPÇÕES DE E-MAIL (COPIAR ENDEREÇO OU ENCAMINHAR)
  // ============================================================================
  const modalEmail = document.getElementById('modal-email');
  const botoesAbrirEmail = document.querySelectorAll('.btn-abrir-email-opcoes');
  const btnOpcaoCopiarEmail = document.getElementById('btn-opcao-copiar-email');
  const feedbackCopiaEmail = document.getElementById('feedback-copia-email');
  const emailAntony = 'antonycosta.dev@gmail.com';

  // Abre as opções de e-mail ao clicar em qualquer gatilho
  botoesAbrirEmail.forEach((botao) => {
    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      if (modalEmail) {
        if (feedbackCopiaEmail) feedbackCopiaEmail.classList.remove('visivel');
        abrirModalUnico(modalEmail);
      }
    });
  });

  // Copia o endereço com fallback robusto e feedback visual
  if (btnOpcaoCopiarEmail) {
    btnOpcaoCopiarEmail.addEventListener('click', () => {
      function exibirFeedback() {
        if (feedbackCopiaEmail) {
          feedbackCopiaEmail.classList.add('visivel');
          setTimeout(() => {
            feedbackCopiaEmail.classList.remove('visivel');
          }, 3500);
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailAntony).then(exibirFeedback).catch(() => {
          copiarTextoLegado(emailAntony);
          exibirFeedback();
        });
      } else {
        copiarTextoLegado(emailAntony);
        exibirFeedback();
      }
    });
  }

  function copiarTextoLegado(texto) {
    const inputTemp = document.createElement('textarea');
    inputTemp.value = texto;
    inputTemp.setAttribute('readonly', '');
    inputTemp.style.position = 'absolute';
    inputTemp.style.left = '-9999px';
    document.body.appendChild(inputTemp);
    inputTemp.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.warn('Não foi possível copiar automaticamente:', err);
    }
    document.body.removeChild(inputTemp);
  }

  // ============================================================================
  // 6. FECHAMENTO GENÉRICO DE MODAIS (BOTÃO FECHAR, OVERLAY E TECLA ESC)
  // ============================================================================
  function fecharTodosModais() {
    if (modalProjeto) modalProjeto.classList.remove('ativo');
    if (modalCv) modalCv.classList.remove('ativo');
    if (modalEmail) modalEmail.classList.remove('ativo');
  }

  // Botões de fechar (o "X" e o botão "Fechar Janela")
  const botoesFechar = document.querySelectorAll('.btn-fechar-modal, .btn-fechar-modal-acao');
  botoesFechar.forEach((botao) => {
    botao.addEventListener('click', fecharTodosModais);
  });

  // Fecha ao clicar fora do conteúdo da janela do modal (no backdrop escuro)
  [modalProjeto, modalCv, modalEmail].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (evento) => {
        if (evento.target === modal) {
          fecharTodosModais();
        }
      });
    }
  });

  // Fecha o modal ao pressionar a tecla Escape (Acessibilidade)
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      fecharTodosModais();
    }
  });

  // ============================================================================
  // 7. FORMULÁRIO DE CONTATO (SIMULAÇÃO DE ENVIO E FEEDBACK VISUAL)
  // ============================================================================
  const formContato = document.getElementById('form-contato');
  const feedbackEnvio = document.getElementById('feedback-envio');

  if (formContato && feedbackEnvio) {
    formContato.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const btnSubmit = formContato.querySelector('button[type="submit"]');
      if (btnSubmit) {
        btnSubmit.textContent = 'Enviando mensagem...';
        btnSubmit.disabled = true;
      }

      setTimeout(() => {
        if (btnSubmit) {
          btnSubmit.textContent = 'Enviar Mensagem';
          btnSubmit.disabled = false;
        }

        feedbackEnvio.classList.add('visivel');
        formContato.reset();

        setTimeout(() => {
          feedbackEnvio.classList.remove('visivel');
        }, 5000);
      }, 500);
      
    });
  }
});
