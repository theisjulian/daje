"""Erzeugt alle Lied-/Film-Pakete: python3 werkzeuge/hoeren/build.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import lib
import en1, en2, en3, it1, it2
lib.write()
