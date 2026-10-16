import random

print("Hola, ¿cómo te llamas?")

nombre = input()

print(f"Encantado de conocerte, {nombre}")

correcto = False

while not correcto:
    print("Dime el número mínimo:")
    minimo = int(input())

    print("Dime el número máximo:")
    maximo = int(input())

    if minimo < 0 or maximo < 0:
        print("Error: los números no pueden ser menores que 0")

    elif maximo < minimo:
        print("Error: el número máximo no puede ser menor que el mínimo")

    else:
        correcto = True

numero_aleatorio = random.randint(minimo, maximo)

print(f"Tu número aleatorio es: {numero_aleatorio}")