import cv2
import numpy as np

def detectar_tabuleiro(frame):
    """
    Detecta tabuleiro com borda vermelha no frame
    Retorna o frame com a borda verde desenhada
    """
    # Converter para HSV
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Máscaras para tons de vermelho (vermelho está em 2 regiões no HSV)
    limite1_inf = np.array([0, 100, 100])
    limite1_sup = np.array([10, 255, 255])
    limite2_inf = np.array([160, 100, 100])
    limite2_sup = np.array([179, 255, 255])
    
    # Combinar duas máscaras
    mascara1 = cv2.inRange(hsv, limite1_inf, limite1_sup)
    mascara2 = cv2.inRange(hsv, limite2_inf, limite2_sup)
    mascara_vermelho = cv2.bitwise_or(mascara1, mascara2)
    
    # Aplicar operações morfológicas para limpar a máscara
    kernel = np.ones((5,5), np.uint8)
    mascara_vermelho = cv2.morphologyEx(mascara_vermelho, cv2.MORPH_CLOSE, kernel)
    mascara_vermelho = cv2.morphologyEx(mascara_vermelho, cv2.MORPH_OPEN, kernel)
    
    # Encontrar contornos na máscara
    contornos, _ = cv2.findContours(mascara_vermelho, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Selecionar maior contorno com 4 lados (quadrilátero)
    maior_area = 0
    contorno_borda = None
    
    for contorno in contornos:
        # Filtrar contornos muito pequenos
        area = cv2.contourArea(contorno)
        if area < 1000:  # área mínima
            continue
            
        perimetro = cv2.arcLength(contorno, True)
        aprox = cv2.approxPolyDP(contorno, 0.02 * perimetro, True)
        
        # Verificar se é um quadrilátero
        if len(aprox) == 4:
            if area > maior_area:
                maior_area = area
                contorno_borda = aprox
    
    # Desenhar borda verde grossa se encontrou o tabuleiro
    frame_resultado = frame.copy()
    
    if contorno_borda is not None:
        # Desenhar contorno verde grosso
        cv2.drawContours(frame_resultado, [contorno_borda], -1, (0, 255, 0), 8)
        
        # Adicionar texto indicando detecção
        cv2.putText(frame_resultado, "TABULEIRO DETECTADO", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Mostrar área do tabuleiro
        cv2.putText(frame_resultado, f"Area: {int(maior_area)}", (10, 70), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    else:
        # Mostrar que não detectou
        cv2.putText(frame_resultado, "Procurando tabuleiro...", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    return frame_resultado, mascara_vermelho

def main():
    # Inicializar captura de webcam
    cap = cv2.VideoCapture(0)
    
    # Verificar se a webcam foi aberta corretamente
    if not cap.isOpened():
        print("❌ Erro: Não foi possível abrir a webcam")
        return
    
    # Configurar resolução (opcional)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print("🎥 Webcam iniciada! Pressione 'q' para sair")
    print("📋 Posicione um tabuleiro com borda vermelha na frente da câmera")
    
    while True:
        # Capturar frame
        ret, frame = cap.read()
        
        if not ret:
            print("❌ Erro ao capturar frame")
            break
        
        # Detectar tabuleiro
        frame_com_deteccao, mascara = detectar_tabuleiro(frame)
        
        # Mostrar resultado
        cv2.imshow('Detector de Tabuleiro', frame_com_deteccao)
        
        # Mostrar máscara (opcional - descomente para debug)
        # cv2.imshow('Mascara Vermelha', mascara)
        
        # Verificar se 'q' foi pressionado para sair
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('m'):
            # Alternar visualização da máscara com 'm'
            cv2.imshow('Mascara Vermelha', mascara)
    
    # Limpar recursos
    cap.release()
    cv2.destroyAllWindows()
    print("✅ Programa encerrado")

if __name__ == "__main__":
    main()
