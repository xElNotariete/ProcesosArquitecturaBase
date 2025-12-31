# 🎮 TANK BATTLE - Estilo Bomberman

Juego de tanques con mecánicas inspiradas en Bomberman. Destruye enemigos, recolecta power-ups y sobrevive en un laberinto lleno de acción.

## 🚀 Inicio Rápido

```bash
npm start
```

Luego abre tu navegador en `http://localhost:8080`

## 🎯 Objetivo

Elimina a todos los tanques enemigos para ganar. ¡No dejes que te destruyan!

## 🕹️ Controles

| Tecla | Acción |
|-------|--------|
| **W** | Mover arriba |
| **S** | Mover abajo |
| **A** | Mover izquierda |
| **D** | Mover derecha |
| **SPACE** | Disparar proyectil |
| **B** | Colocar bomba (requiere power-up) |

## 💎 Power-Ups

Destruye paredes moradas para encontrar power-ups:

| Icono | Nombre | Efecto |
|-------|--------|--------|
| ⚡ | **Velocidad** | Aumenta la velocidad de movimiento |
| 🔥 | **Disparo Rápido** | Reduce el tiempo entre disparos |
| ❤️ | **Vida Extra** | Aumenta tu vida máxima |
| 🛡️ | **Escudo** | Protección temporal contra daño |
| ✨ | **Disparo Múltiple** | Dispara 3 proyectiles a la vez |
| 💣 | **Bomba** | Desbloquea bombas explosivas |

## 🎨 Paleta de Colores

- **Rosa (#ff1493)**: Jugador, elementos principales
- **Morado (#9d4edd)**: Paredes destructibles, UI
- **Naranja (#ff6b35)**: Enemigos, explosiones
- **Rosa claro (#ff69b4)**: Detalles, power-ups

## 🗺️ Mapa

- **Paredes Moradas Oscuras**: Indestructibles, bloqueadas permanentemente
- **Paredes Moradas Claras**: Destructibles, pueden contener power-ups
- **Espacios Vacíos**: Área de movimiento libre

## ⚔️ Sistema de Combate

### Disparos
- Los proyectiles viajan en línea recta
- Destruyen paredes destructibles
- Cada impacto causa 1 punto de daño
- Tienen alcance limitado

### Bombas
- Se colocan en tu posición actual
- Explotan después de 3 segundos
- Crean explosión en cruz (como Bomberman)
- Destruyen múltiples paredes
- Radio de explosión aumenta con power-ups

### Enemigos
- **IA Simple**: Se mueven aleatoriamente
- Disparan ocasionalmente
- Diferentes colores (naranja/rosa)
- 3 puntos de vida cada uno

## 📊 Puntuación

- Destruir pared: **+10 puntos**
- Recoger power-up: **+50 puntos**
- Eliminar enemigo: **+100 puntos**
- Bomba contra enemigo: **+150 puntos**

## 🎮 Mecánicas del Juego

### Movimiento
- Vista top-down (desde arriba)
- Colisiones con paredes y obstáculos
- El tanque rota según la dirección de movimiento

### Vida y Daño
- Comienzas con 3 vidas
- Invulnerabilidad temporal tras recibir daño (parpadeo)
- Barra de vida sobre cada tanque
- Game Over si pierdes todas las vidas

### Victoria
- Elimina a todos los enemigos para ganar
- Tu puntuación se muestra al final
- Presiona F5 para jugar de nuevo

## 🏗️ Arquitectura del Código

```
tankBattle.js
├── TankBattle (Clase principal)
│   ├── Inicialización
│   ├── Generación de mapa
│   ├── Bucle de juego
│   ├── Sistema de colisiones
│   └── Renderizado
│
├── Tanque (Clase de entidad)
│   ├── Movimiento
│   ├── Disparo
│   ├── Bombas
│   └── Power-ups
│
└── Utilidades
    ├── Partículas
    ├── Explosiones
    └── HUD
```

## 🎯 Características Técnicas

- **60 FPS**: Renderizado fluido
- **Sistema de partículas**: Efectos visuales dinámicos
- **IA de enemigos**: Movimiento y disparo automático
- **Generación procedural**: Mapa aleatorio en cada partida
- **Sistema de power-ups**: 6 tipos diferentes
- **Efectos de iluminación**: Sombras y brillos neón

## 🔧 Personalización

### Dificultad
Puedes ajustar la dificultad modificando en `tankBattle.js`:

```javascript
// Línea ~275: Número de enemigos
this.crearEnemigos(4); // Cambia el número

// Línea ~60: Vida del jugador
this.vida = 3; // Cambia las vidas iniciales

// Línea ~58: Velocidad
this.velocidad = 2; // Cambia la velocidad
```

### Tamaño del Mapa
```javascript
// Línea ~10-11
this.filas = 15;    // Altura del mapa
this.columnas = 17; // Anchura del mapa
```

### Colores
```javascript
// Línea ~37-46: Paleta de colores
this.colores = {
    fondo: '#0a0520',
    paredSolida: '#6a0dad',
    // ... personaliza aquí
};
```

## 🐛 Solución de Problemas

**El juego no carga:**
- Verifica que `npm start` esté corriendo
- Asegúrate de que el puerto 8080 esté libre
- Revisa la consola del navegador (F12)

**Lag o bajones de FPS:**
- Reduce el número de enemigos
- Disminuye la cantidad de partículas
- Cierra otras pestañas del navegador

**Los controles no responden:**
- Haz clic en el canvas del juego
- Verifica que no haya otras ventanas capturando el teclado

## 📝 Notas de Desarrollo

- El juego se carga automáticamente al entrar a la página
- No requiere autenticación ni login
- Completamente jugable en solitario
- Preparado para futura expansión multijugador

## 🎨 Inspiración

Basado en el clásico **Bomberman** con temática de tanques y estética cyberpunk rosa/morado.

## 🏆 Consejos Pro

1. **Busca Power-ups**: Destruye todas las paredes moradas que puedas
2. **Usa las Bombas Estratégicamente**: Perfectas para escapar o destruir múltiples paredes
3. **Mantén la Distancia**: Los proyectiles enemigos viajan rápido
4. **Esquinas Seguras**: Usa las paredes sólidas como cobertura
5. **Disparo Múltiple es OP**: Busca este power-up primero
6. **Las Bombas Dañan a Todos**: Incluyéndote a ti, ¡ten cuidado!

---

**¡Buena suerte, comandante! 🎖️**
