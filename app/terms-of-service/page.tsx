export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Lietošanas noteikumi</h1>

      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Vispārīgie noteikumi</h2>
          <p>
            Šie lietošanas noteikumi attiecas uz LearnNest platformas lietošanu. 
            Lietojot mūsu platformu, jūs piekrītat šiem noteikumiem.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Nodarbību noteikumi</h2>
          <h3 className="text-xl font-semibold mb-2">2.1. Pasniedzējiem</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Pasniedzējiem ir jānodrošina nodarbības atbilstoši norādītajam aprakstam un kvalitātei
            </li>
            <li>
              Nodarbību atcelšana ir jāpaziņo vismaz 24 stundas iepriekš
            </li>
            <li>
              Pasniedzējiem ir jāievēro konfidencialitāte attiecībā uz skolēnu informāciju
            </li>
            <li>
              Cenas ir jānorāda eiro (€) un tām jābūt galīgajām
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">2.2. Skolēniem</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Nodarbību atcelšana bez maksas ir iespējama 24 stundas pirms nodarbības
            </li>
            <li>
              Nodarbību pārplānošana ir iespējama 48 stundas pirms nodarbības
            </li>
            <li>
              Neierašanās gadījumā maksa netiek atmaksāta
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Maksājumi</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Visiem maksājumiem jātiek veiktiem caur platformu
            </li>
            <li>
              Platformas komisijas maksa ir 10% no nodarbības cenas
            </li>
            <li>
              Atmaksa tiek veikta saskaņā ar atcelšanas politiku
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Platformas lietošana</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Aizliegts izmantot platformu nelegālām darbībām
            </li>
            <li>
              Lietotājiem jāievēro cieņpilna komunikācija
            </li>
            <li>
              Platformai ir tiesības bloķēt lietotājus, kuri pārkāpj noteikumus
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Intelektuālais īpašums</h2>
          <p>
            Visa platformas saturs, ieskaitot, bet neaprobežojoties ar tekstu, grafikām, 
            logotipiem, ikonām, attēliem un programmatūru, ir LearnNest īpašums un ir 
            aizsargāts ar autortiesībām.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Atbildības ierobežojumi</h2>
          <p>
            LearnNest neuzņemas atbildību par:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Nodarbību kvalitāti (tomēr mēs cenšamies nodrošināt augstu kvalitāti)
            </li>
            <li>
              Tehniskiem traucējumiem, kas nav mūsu kontrolē
            </li>
            <li>
              Lietotāju radītiem zaudējumiem citiem lietotājiem
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Izmaiņas noteikumos</h2>
          <p>
            LearnNest patur tiesības jebkurā brīdī mainīt šos noteikumus. 
            Par būtiskām izmaiņām lietotāji tiks informēti.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Kontaktinformācija</h2>
          <p>
            Ja jums ir jautājumi par šiem noteikumiem, lūdzu sazinieties ar mums:
          </p>
          <ul className="list-none space-y-2">
            <li>E-pasts: info@learnnest.com</li>
            <li>Tālrunis: +371 12345678</li>
            <li>Adrese: Rīga, Latvija</li>
          </ul>
        </section>

        <div className="text-sm text-gray-600 mt-8">
          Pēdējo reizi atjaunināts: {new Date().toLocaleDateString('lv-LV')}
        </div>
      </div>
    </div>
  );
}
