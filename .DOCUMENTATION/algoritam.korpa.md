User - dodaj robu u korpu:
1. Da li postoji u bazi podataka za korisnika otvorena korpa koja nije iskorišćena (za koju se ne vezuje porudžbina)?
    - Da: Koristimo tu korpi i dodajemo robu.
    - Ne: Napraviti novu korpu za korisnika i u nju dodati robu.

2. Da li korisnik dodaje u robu koja već postoji u korpi (! količina).
    Ne: Dodajemo evidenciju te robe (+ količina) u korpu.
    Da: Menjamo evidenciju dodate robe, tako da uvećamo količinu koja je več u korpi za količinu koja se dodaje.

3. Vratiti sve podatke o korpi za trenutno aktivnog korisnika i evidenciju dodatih artikala i podatke o samim artiklima kao i njihove proširene podatke.


Izmena dodate robe u korpi:
1. Da li postoji u bazi podataka za korisnika otvorena korpa koja nije iskorišćena (za koju se ne vezuje porudžbina)?
    - Da: Da li postoji evidencija da je tražena roba dodata u korpu?
        - Da: Za tu evidenciju dodate robe menajamo količinu.
        -Ne. Ne radimo ništa.
    - Ne: Ne radimo ništa

2. Ako je u korpi korisnika za evidentiranu robu količina sada 0, treba da obrišemo tu evidenciju dodate robe iz korpe.

3. Vratiti sve podatke o korpi za trenutno aktivnog korisnika i evidenciju dodatih artikala i podatke o samim artiklima kao i njihove proširene podatke.