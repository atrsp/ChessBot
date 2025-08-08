import cv2
import time

def capturar_fotos_antes_depois():
    """
    Captura duas fotos usando a webcam: uma 'antes' e outra 'depois'
    Salva as imagens como before.jpg e after.jpg
    """
    
    # Inicializa a câmera (0 é geralmente a câmera padrão)
    cap = cv2.VideoCapture(0)
    
    # Verifica se a câmera foi aberta corretamente
    if not cap.isOpened():
        print("Erro: Não foi possível acessar a câmera")
        return
    
    print("Câmera inicializada com sucesso!")
    print("Pressione ESPAÇO para capturar a foto 'ANTES'")
    print("Pressione ESC para sair")
    
    foto_antes_capturada = False
    
    while True:
        # Captura frame por frame
        ret, frame = cap.read()
        
        if not ret:
            print("Erro: Não foi possível capturar o frame")
            break
        
        # Mostra o frame atual
        if not foto_antes_capturada:
            cv2.putText(frame, "Pressione ESPACO para foto ANTES", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:
            cv2.putText(frame, "Pressione ESPACO para foto DEPOIS", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        cv2.imshow('Camera - Antes e Depois', frame)
        
        # Captura teclas
        key = cv2.waitKey(1) & 0xFF
        
        # ESC para sair
        if key == 27:  # ESC
            print("Saindo...")
            break
            
        # ESPAÇO para capturar foto
        elif key == 32:  # ESPAÇO
            if not foto_antes_capturada:
                # Captura foto "antes"
                cv2.imwrite('before.jpg', frame)
                print("Foto 'ANTES' capturada e salva como 'before.jpg'")
                foto_antes_capturada = True
                print("Agora pressione ESPAÇO novamente para capturar a foto 'DEPOIS'")
            else:
                # Captura foto "depois"
                cv2.imwrite('after.jpg', frame)
                print("Foto 'DEPOIS' capturada e salva como 'after.jpg'")
                print("Ambas as fotos foram capturadas com sucesso!")
                break
    
    # Libera a câmera e fecha todas as janelas
    cap.release()
    cv2.destroyAllWindows()

def capturar_com_delay():
    """
    Versão alternativa: captura as fotos automaticamente com delay
    """
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Erro: Não foi possível acessar a câmera")
        return
    
    print("Preparando para capturar foto 'ANTES'...")
    
    # Aquece a câmera
    for i in range(30):
        ret, frame = cap.read()
    
    # Countdown para foto "antes"
    for i in range(3, 0, -1):
        ret, frame = cap.read()
        cv2.putText(frame, f"Foto ANTES em: {i}", (50, 100), 
                   cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
        cv2.imshow('Countdown', frame)
        cv2.waitKey(1000)  # Espera 1 segundo
    
    # Captura foto "antes"
    ret, frame = cap.read()
    cv2.imwrite('before.jpg', frame)
    print("Foto 'ANTES' capturada!")
    
    # Aviso para mudança
    print("Faça sua mudança agora! Próxima foto em 5 segundos...")
    time.sleep(2)
    
    # Countdown para foto "depois"
    for i in range(3, 0, -1):
        ret, frame = cap.read()
        cv2.putText(frame, f"Foto DEPOIS em: {i}", (50, 100), 
                   cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 3)
        cv2.imshow('Countdown', frame)
        cv2.waitKey(1000)  # Espera 1 segundo
    
    # Captura foto "depois"
    ret, frame = cap.read()
    cv2.imwrite('after.jpg', frame)
    print("Foto 'DEPOIS' capturada!")
    
    cap.release()
    cv2.destroyAllWindows()
    print("Ambas as fotos foram salvas com sucesso!")

if __name__ == "__main__":
    print("Escolha o modo de captura:")
    print("1 - Manual (pressione ESPAÇO para cada foto)")
    print("2 - Automático (com countdown)")
    
    escolha = input("Digite 1 ou 2: ").strip()
    
    if escolha == "1":
        capturar_fotos_antes_depois()
    elif escolha == "2":
        capturar_com_delay()
    else:
        print("Opção inválida. Usando modo manual...")
        capturar_fotos_antes_depois()
