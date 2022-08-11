/*
estados do jogo em binários
var - variável é a mente do pc. Um escopo global
Se tu for criar uma imagem, sprite, corpo físico
número, som ou qualquer outra coisa. NÃO SE
ESQUEÇA DE CRIAR A VAR ANTES
*/
var PLAY = 1;
var END = 0;
var gameState = PLAY;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;

var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4;
var backgroundImg
var score=0;
var jumpSound, collidedSound;

var gameOver, restart;

//precarrega imagens, animações e sons
function preload()
{
  jumpSound = loadSound("jump.wav")
  collidedSound = loadSound("collided.wav")
  
  backgroundImg = loadImage("backgroundImg.png")
  sunAnimation = loadImage("sun.png");
  
  trex_running = loadAnimation("trex_2.png","trex_1.png","trex_3.png");
  trex_collided = loadAnimation("trex_collided.png");
  
  groundImage = loadImage("ground.png");
  
  cloudImage = loadImage("cloud.png");
  
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  
  gameOverImg = loadImage("gameOver.png");
  restartImg = loadImage("restart.png");
}

function setup() 
{
  createCanvas(windowWidth, windowHeight);
  
  sun = createSprite(width-50,100,10,10);
  sun.addAnimation("sun", sunAnimation);
  sun.scale = 0.1
  
  trex = createSprite(50,height-70,20,50);
  
  
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.setCollider('circle',0,0,350)
  trex.scale = 0.08
  // trex.debug=true
  
  invisibleGround = createSprite(width/2,height-10,width,125);  
  invisibleGround.shapeColor = "#f4cbaa";
  
  ground = createSprite(width/2,height,width,2);
  ground.addImage("ground",groundImage);
  ground.x = width/2
  ground.velocityX = -(6 + 3*score/100);
  
  gameOver = createSprite(width/2,height/2- 50);
  gameOver.addImage(gameOverImg);
  
  restart = createSprite(width/2,height/2);
  restart.addImage(restartImg);
  
  gameOver.scale = 0.5;
  restart.scale = 0.1;

  gameOver.visible = false;
  restart.visible = false;
  
 
  // invisibleGround.visible =false

  //criando grupos/pastas para colocar as coisas dentro
  cloudsGroup = new Group();
  obstaclesGroup = new Group();
  
  score = 0;
}

function draw() 
{
  background(backgroundImg);
  textSize(20);
  fill("black")
  text("Score: "+ score,30,50);
  
  //durante o jogo o que vai acontecer?
  if (gameState===PLAY)
  {
    //correndo a pontuação
    score = score + Math.round(getFrameRate()/60);
   //chão anda e aumenta a velocidade a cada 100 pontos
    ground.velocityX = -(6 + 3*score/100);
    
    //se alguem tocar na tela ou apertar espaço: pular
    if((touches.length > 0 || keyDown("SPACE")) && trex.y  >= height-120) 
    {
      jumpSound.play( )
      trex.velocityY = -10;
      //matriz sem nenhum toque para ter toques infinitos *-*
       touches = [];
    }
    
    trex.velocityY = trex.velocityY + 0.8
   
    //ilusão de ótica: chão infinito
    if (ground.x < 0)
    {
      ground.x = ground.width/2;
    }
  
    trex.collide(invisibleGround);
    //chamando a função: fazer nuvens
    spawnClouds();
    //chamando a função: fazer obstaculos
    spawnObstacles();
  
    //se o trex tocar o grupo de obstaculos: END
    if(obstaclesGroup.isTouching(trex)){
        collidedSound.play()
        gameState = END;
    }
  }

  //o que vai acontecer quando der game oveer?
  else if (gameState === END) 
  {
    //aparecer os icones
    gameOver.visible = true;
    restart.visible = true;
    
    //definindo a velocidade de cada objeto do jogo para 0
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);
    
    //mudando a animação do trex para O.o
    trex.changeAnimation("collided",trex_collided);
    
    //definir tempo de vida aos objetos do jogo para que nunca sejam destruídos
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
    
    //tocar na tela ou apertar espaço para reiniciar
    if(touches.length>0 || keyDown("SPACE")) 
    {      
      reset();
      touches = []
    }
  }
  
  //desenhar todos os sprites da tela
  drawSprites();
}

function spawnClouds() 
{
  //escreva o código aqui para gerar as nuvens
  if (frameCount % 60 === 0) 
  {
    var cloud = createSprite(width+20,height-300,40,10);
    cloud.y = Math.round(random(100,220));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     /*tempo de vida que algo durará na tela. No 
     caso das nuvens elas estão se movendo no x, 
     ou seja pela largura da tela. 
     Quando é assim pegamos o tamanho da 
     largura da tela e dividimos pela velocidade do 
     sprite (no caso aqui da nuvem) para saber 
     quanto tempo de fps ela precisará para rolar 
     até o final da tela */
    cloud.lifetime = 300;
    
    //ajustar a profundidade (igual as camadas nos editores de imagens)
    cloud.depth = trex.depth;
    trex.depth = trex.depth+1;
    
    //adicione cada nuvem ao grupo
    cloudsGroup.add(cloud);
  }
  
}

//função para fazer cactos um atrás do outro
function spawnObstacles() 
{
  //frameCount = fps, a cada um segundo cria um cacto
  if(frameCount % 60 === 0) 
  {
    var obstacle = createSprite(600,height-95,20,30);
    //arrumando a colisão do obstaculo
    obstacle.setCollider('circle',0,0,45)
    // obstacle.debug = true
  
    //a cada 100 pontos no score a velocidade aumenta
    obstacle.velocityX = -(6 + 3*score/100);
    
    //gerar obstáculos aleatórios com imagens diferentes
    var rand = Math.round(random(1,2));
    switch(rand) 
    {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      default: break;
    }
    
    /*
    atribuindo dimensão e tempo de vida 
    aos obstáculos
    Profundidade ajustada para ficar abaixo 
    do trex
    */           
    obstacle.scale = 0.3;
    obstacle.lifetime = 300;
    obstacle.depth = trex.depth;
    trex.depth +=1;
    //adicione cada obstáculo ao grupo
    obstaclesGroup.add(obstacle);
  }
}

//função para reiniciar o jogo
function reset()
{
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;

  /*
  bora destruir todos os cactos e nuvens 
  para recomeçar a fazer todos de novo?
  */
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  
  trex.changeAnimation("running",trex_running);
  
  score = 0;
  
}
