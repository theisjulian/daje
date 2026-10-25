/* Eigene kurze Lernhinweise; Belege und Übertragungsgrenzen pro Methode. */
const TIP_SOURCES = {
  retrieval: {
    label: 'Karpicke & Roediger, 2008',
    citation:
      'Karpicke, J. D., & Roediger, H. L., III. (2008). The critical importance of retrieval for learning. Science, 319(5865), 966–968.',
    url: 'https://doi.org/10.1126/science.1152408',
    note: 'Vokabelexperiment mit Studierenden: Wiederholtes Abrufen unterstützte die spätere Erinnerung. Die hier vorgeschlagenen Übungen übertragen das Prinzip auf den Trainer; sie sind nicht selbst in der Studie getestet.'
  },
  spacing: {
    label: 'Cepeda et al., 2008',
    citation:
      'Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. Psychological Science, 19(11), 1095–1102.',
    url: 'https://doi.org/10.1111/j.1467-9280.2008.02209.x',
    note: 'Experiment zum Faktenlernen: Günstige Abstände hängen vom späteren Abrufzeitpunkt ab. Die Abstände 1, 3, 7 und 14 Tage sind hier eine einfache Produktregel, kein universell optimaler oder für diesen Trainer validierter Plan.'
  },
  writing: {
    label: 'Ye & Shi, 2025 · online 2022',
    citation:
      'Ye, S. X., & Shi, J. (2025; online 2022). Comparing the impact of word writing and typing via mobile devices on L2 vocabulary learning. Educational Studies, 51(2), 246–251.',
    url: 'https://doi.org/10.1080/03055698.2022.2132815',
    note: 'Die Untersuchung verglich Kopieren durch Schreiben und Tippen. Beide zeigten Vorteile gegenüber der Kontrollbedingung, abhängig vom Testzeitpunkt. Sie beweist keine allgemeine Überlegenheit der Handschrift. Schreiben aus dem Gedächtnis ist zusätzlich eine Anwendung des Abrufprinzips.'
  },
  feedback: {
    label: 'Belardi et al., 2021 · Korrektur 2025',
    citation:
      'Belardi, A., Pedrett, S., Rothen, N., & Reber, T. P. (2021). Spacing, feedback, and testing boost vocabulary learning in a web application. Frontiers in Psychology, 12, 757262. Korrektur: 2025, 16, 1629682.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8638698/',
    note: 'Web-Vokabelstudie mit 79 Teilnehmenden. Korrigierendes Feedback und sein Zusammenspiel mit Tests unterstützten das Lernen. Wegen teilweise nicht zufälliger Gruppenzuweisung ist der Spacing-Befund eingeschränkt. Berücksichtigte Korrektur von 2025; keine Prozentversprechen für diese App.'
  },
  pictures: {
    label: 'Carpenter & Olson, 2012',
    citation:
      'Carpenter, S. K., & Olson, K. M. (2012). Are pictures good for learning new vocabulary in a foreign language? Only if you think they are not. Journal of Experimental Psychology: Learning, Memory, and Cognition, 38(1), 92–101.',
    url: 'https://doi.org/10.1037/a0024828',
    note: 'Experimente zum Swahili-Wortlernen: Bilder waren nicht automatisch besser als Übersetzungen. Überschätzung des eigenen Wissens spielte eine Rolle. Abruftraining beziehungsweise entsprechende Hinweise veränderten das Ergebnis.'
  },
  drawing: {
    label: 'Wammes et al., 2018',
    citation:
      'Wammes, J. D., Meade, M. E., & Fernandes, M. A. (2018). Creating a recollection-based memory through drawing. Journal of Experimental Psychology: Learning, Memory, and Cognition, 44(5), 734–751.',
    url: 'https://doi.org/10.1037/xlm0000445',
    note: 'Mehrere Experimente fanden Vorteile des Zeichnens für spätere Gedächtnistests gegenüber dem Schreiben von Wörtern. Keine direkte Studie zum italienischen Lehrwerkswortschatz: Die Skizzenaufgabe ist eine praktische Übertragung, kein nachgewiesener Vorteil für jede Vokabel.'
  },
  aloud: {
    label: 'MacLeod et al., 2010',
    citation:
      'MacLeod, C. M., Gopie, N., Hourihan, K. L., Neary, K. R., & Ozubko, J. D. (2010). The production effect: Delineation of a phenomenon. Journal of Experimental Psychology: Learning, Memory, and Cognition, 36(3), 671–685.',
    url: 'https://doi.org/10.1037/a0018785',
    note: 'In Wiedererkennungsexperimenten wurden einige laut gesprochene Wörter besser erinnert als still gelesene. Der Effekt hing von der Versuchsanordnung ab. Lautsprechen ist eine ergänzende Übung und kein garantierter Vorteil beim fremdsprachlichen Gebrauch oder ein Aussprachetraining mit Korrektur.'
  },
  styles: {
    label: 'Pashler et al., 2008',
    citation:
      'Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. Psychological Science in the Public Interest, 9(3), 105–119.',
    url: 'https://doi.org/10.1111/j.1539-6053.2009.01038.x',
    note: 'Die Forschungsübersicht fand keine ausreichende Evidenz dafür, Unterricht allgemein an diagnostizierte Lerntypen anzupassen. Vorlieben sind möglich; eine Vorliebe ist kein Nachweis der wirksamsten Lernmethode.'
  }
};
const LEARNING_TIPS = [
  {
    id: 'abruf',
    category: 'Erinnern',
    title: 'Erst denken. Dann aufdecken.',
    text: 'Überlege deine Antwort, bevor du die Karte umdrehst. Erkennen fühlt sich leichter an als selbst erinnern.',
    visual: 'recall',
    action: 'Karten üben',
    mode: 'cards',
    sources: ['retrieval']
  },
  {
    id: 'abstand',
    category: 'Wiederholen',
    title: 'Morgen wieder. Nicht alles heute.',
    text: 'Verteile deine Runden auf mehrere Tage. Schwierige Wörter kommen früher zurück; sichere mit größerem Abstand.',
    visual: 'spacing',
    action: 'Fällige Wörter ansehen',
    nav: 'fortschritt',
    sources: ['spacing']
  },
  {
    id: 'handschrift',
    category: 'Schreiben',
    title: 'Abdecken. Aufschreiben. Prüfen.',
    text: 'Schreibe einige Antworten aus dem Gedächtnis auf Papier. Kontrolliere danach Wort, Artikel und Akzent. Bloßes Abschreiben ersetzt das Erinnern nicht.',
    visual: 'paper',
    action: 'Karten für Papier öffnen',
    mode: 'cards',
    sources: ['writing', 'retrieval']
  },
  {
    id: 'fehler',
    category: 'Erinnern',
    title: 'Ein Fehler zeigt den nächsten Schritt.',
    text: 'Vergleiche deine Antwort mit der Lösung. Achte auf den Unterschied und versuche das Wort später ohne Vorlage erneut.',
    visual: 'error',
    action: 'Schreiben üben',
    mode: 'write',
    sources: ['feedback']
  },
  {
    id: 'bekannt',
    category: 'Wiederholen',
    title: 'Einmal richtig ist ein Anfang.',
    text: 'Lass auch gekonnte Wörter in späteren Runden wieder auftauchen. Erst nach mehreren Tagen merkst du, was hängen geblieben ist.',
    visual: 'again',
    action: 'Deine Wiederholung',
    nav: 'fortschritt',
    sources: ['retrieval', 'spacing']
  },
  {
    id: 'bilder',
    category: 'Bilder',
    title: 'Das Bild hilft. Du erinnerst dich.',
    text: 'Schau das Foto an und finde das Wort selbst. Ein vertrautes Motiv bedeutet noch nicht, dass du die Vokabel abrufen kannst.',
    visual: 'picture',
    action: 'Bildkarten ausprobieren',
    special: 'pictures',
    sources: ['pictures']
  },
  {
    id: 'zeichnen',
    category: 'Bilder',
    title: 'Mach dir dein eigenes Bild.',
    text: 'Skizziere einen gut darstellbaren Begriff, etwa ein Fahrrad. Schreibe das Wort dazu und prüfe später, ob du es zur Skizze noch weißt.',
    visual: 'sketch',
    action: 'Passende Wörter auswählen',
    nav: 'wortschatz',
    sources: ['drawing']
  },
  {
    id: 'laut',
    category: 'Erinnern',
    title: 'Sag ein paar Wörter laut.',
    text: 'Sprich ausgewählte Wörter bewusst aus. Nutze das ergänzend zum Abrufen und Schreiben, statt dich nur auf das Vorlesen zu verlassen.',
    visual: 'aloud',
    action: 'Karten laut üben',
    mode: 'cards',
    sources: ['aloud']
  },
  {
    id: 'lernziel',
    category: 'Erinnern',
    title: 'Dein Ziel bestimmt den Modus.',
    text: 'Verstehen oder selbst formulieren? Wähle dafür die passende Richtung. Du musst dich keinem festen Lerntyp zuordnen.',
    visual: 'directions',
    action: 'Trainingsmodus wählen',
    nav: 'lernen',
    sources: ['styles'],
    practical: true
  }
];
