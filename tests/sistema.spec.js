const { test, expect } = require('@playwright/test');

test.describe('Sistema UserManager - Tests E2E', () => {
  
  test('Flujo completo: Login, Crear Partida y Ver Partidas', async ({ page }) => {
    // 1. Navegar a la aplicación
    await page.goto('http://localhost:8080/');
    
    // 2. Verificar que la página cargó correctamente
    await expect(page).toHaveTitle(/UserManager/);
    console.log('✓ Página cargada correctamente');
    
    // 3. Hacer clic en "Iniciar Sesión"
    await page.click('text=Iniciar Sesión');
    await page.waitForTimeout(500);
    
    // 4. Rellenar el formulario de inicio de sesión
    await page.fill('#emailLogin', 'samuelnotario100@gmail.com');
    await page.fill('#passwordLogin', 'samuel');
    console.log('✓ Formulario de login rellenado');
    
    // 5. Hacer clic en el botón de iniciar sesión
    await page.click('button[type="submit"]');
    
    // 6. Esperar a que se complete el inicio de sesión y se recargue la página
    await page.waitForTimeout(2000);
    
    // 7. Verificar que se muestra el dashboard
    await expect(page.locator('#dashboard')).toBeVisible();
    console.log('✓ Login exitoso - Dashboard visible');
    
    // 8. Verificar mensaje de bienvenida
    await expect(page.locator('#welcomeMessage')).toContainText('Bienvenido');
    console.log('✓ Mensaje de bienvenida visible');
    
    // 9. Hacer clic en "Crear Partida"
    await page.click('text=Crear Nueva Partida');
    await page.waitForTimeout(500);
    
    // 10. Hacer clic en el botón para crear la partida
    await page.click('button:has-text("Crear Partida")');
    await page.waitForTimeout(1000);
    console.log('✓ Partida creada');
    
    // 11. Verificar que aparece el código de la partida
    const codigoPartida = await page.locator('#codigoPartidaCard');
    await expect(codigoPartida).toBeVisible();
    console.log('✓ Código de partida visible');
    
    // 12. Hacer clic en "Ver Partidas Disponibles"
    await page.click('text=Ver Partidas Disponibles');
    await page.waitForTimeout(1000);
    
    // 13. Verificar que se muestra la lista de partidas
    await expect(page.locator('#listaPartidasCard')).toBeVisible();
    console.log('✓ Lista de partidas visible');
    
    // 14. Hacer clic en actualizar lista
    await page.click('button:has-text("Actualizar Lista")');
    await page.waitForTimeout(500);
    console.log('✓ Lista de partidas actualizada');
    
    // 15. Hacer clic en "Salir"
    await page.click('#btnSalir');
    await page.waitForTimeout(1000);
    
    // 16. Verificar que se muestra la landing page
    await expect(page.locator('#landingPage')).toBeVisible();
    console.log('✓ Logout exitoso - Landing page visible');
  });

  test('Test simple: Verificar carga de página principal', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('http://localhost:8080/');
    
    // Verificar título
    await expect(page).toHaveTitle(/UserManager/);
    
    // Verificar que existe el botón de iniciar sesión (primer botón)
    await expect(page.locator('button').filter({ hasText: 'Iniciar Sesión' }).first()).toBeVisible();
    
    console.log('✓ Test de carga de página completado');
  });

  test('Test: Login con credenciales incorrectas', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('http://localhost:8080/');
    
    // Hacer clic en "Iniciar Sesión"
    await page.click('text=Iniciar Sesión');
    await page.waitForTimeout(500);
    
    // Rellenar con credenciales incorrectas
    await page.fill('#emailLogin', 'usuario@incorrecto.com');
    await page.fill('#passwordLogin', 'contraseña_incorrecta');
    
    // Hacer clic en el botón de iniciar sesión
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Verificar que aparece mensaje de error
    await expect(page.locator('#mensajeLogin')).toBeVisible();
    await expect(page.locator('#mensajeLogin')).toContainText('incorrectos');
    
    console.log('✓ Test de login incorrecto completado');
  });
});
