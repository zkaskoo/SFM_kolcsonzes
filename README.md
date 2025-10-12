Egy weboldal/alkalmazás (ezt még akkor eldöntjük, de többségi szavazata van a weboldalnak), amely lehetővé teszi a használt könyvekkel való 
cserekereskedelmet.

Alap:
a felhasználó fel tud regisztrálni
a regisztráció egy email+jelszó párosítással történhet meg, illetve egy nevet is meg kell adni, ami utána fel lesz tüntetve
több azonos nevű (pl 2 darab Kis Jakab) felhasználó is tudjon létezni egy időben
a bejelentkezésnél az email+jelszó párosítás fog kelleni
ha a bejelentkezés sikertelen volt, akkor hibaüzenet
a felhasználónak saját raktára van, ahol az általa feltöltött könyvek lesznek láthatóak
a feltöltött könyvek egy egységes adat struktúra alapján lesznek eltárolva (pl szerző, cím, kiadás dátuma, de ide még más is jöhet)
több előzetesen létrehozott felhasználó is legyen (pl teszt1, teszt2)
ha egy csere létrejön, akkor bizalmi alapon fog működni, vagyis mind a 2 felhasználónak meg kell erősítenie, hogy a csere létrejött, máskülönben elvetésre kerül
ha sikeres volt a csere, akkor pl a teszt1 felhasználó raktárából eltűnik a könyv, és megjelenik nála a könyv, amire cserélt ( értelem szerűen ugyanez visszafele is)

Egyéb ötletek:
ha szeretnénk, akkor bele tudjuk tenni azt is, hogy a felhasználó el tudja távolítani a könyvet a raktárából
esetleg egy alkalmazáson belüli pénztárcát is csinálhatunk a csere mellé, így nem csak cserélni, hanem vásárolni is lehet egy másik felhasználótól
ha már nagyon benne vagyunk és az időbe is belefér, akkor esetleg azt is megvalósíthatjuk, hogy egy felhasználó törölni tudja a fiókját, minden adattal együtt
esetleg az is bele kerülhet, hogy ha egy fiók (vagyis helyes az email) többször is elrontja a belépéshez szükséges kódot, akkor 1 percig ne tudjon próbálkozni többet