/**
 * anatomy.js — 3D Human Anatomy Explorer (GLTF-Powered)
 * Loads a real Z-Anatomy based GLTF model with 200+ anatomical structures.
 * Features: layer toggling, click-to-inspect, floating labels, X-ray mode, search.
 */
const AnatomySim = (() => {
  let scene, raycaster, mouse;
  let bodyGroup = null;
  let modelLoaded = false;
  let highlightedMesh = null;
  let highlightTimeout = null;
  let clickTooltipEl = null;
  let clickTooltipTarget = null;
  let xrayMode = false;

  // 한국어 라벨 매핑 (식별자 → 사용자 노출 문구)
  const ANATOMY_TYPE_LABEL = {
    muscle: '근육',
    bone: '뼈',
    organ: '장기',
    structure: '구조물'
  };

  // Z-Anatomy 영문 mesh 명을 한국어로 변환 (식별자는 그대로 두고 표시만 번역)
  const ANATOMY_NAME_KO = {
    'brain': '뇌',
    'trachea': '기관', 'bronchi': '기관지', 'bronchus': '기관지',
    'heart': '심장', 'lung': '폐', 'lungs': '폐',
    'liver': '간',
    'kidney': '신장', 'kidneys': '신장',
    'spleen': '비장',
    'bladder': '방광',
    'small intestine': '소장', 'small_intestine': '소장',
    'pancreas': '췌장',
    'stomach': '위',
    'esophagus': '식도',
    'spinal cord': '척수',
    'skull': '두개골', 'cranium': '두개골',
    'mandible': '하악골',
    'vertebrae': '척추뼈', 'vertebra': '척추뼈', 'vertebral': '척추뼈',
    'rib': '늑골', 'ribs': '늑골', 'costal': '늑골',
    'sternum': '흉골',
    'clavicle': '쇄골', 'clavicles': '쇄골',
    'scapula': '견갑골', 'scapulae': '견갑골',
    'humerus': '상완골',
    'radius': '요골',
    'ulna': '자뼈',
    'carpals': '수근골', 'carpal': '수근골',
    'metacarpals': '중수골', 'metacarpal': '중수골',
    'phalanges': '지골', 'phalanx': '지골',
    'femur': '대퇴골', 'femoral': '대퇴골',
    'patella': '슬개골',
    'tibia': '경골',
    'fibula': '비골',
    'tarsals': '족근골', 'tarsal': '족근골',
    'metatarsals': '중족골', 'metatarsal': '중족골',
    'pelvis': '골반', 'pelvic': '골반',
    'ilium': '장골', 'ischium': '좌골', 'pubis': '치골',
    'sacrum': '천골', 'coccyx': '미골',
    'biceps': '상완이두근', 'triceps': '상완삼두근',
    'pectoralis': '대흉근', 'deltoid': '삼각근',
    'quadriceps': '대퇴사두근',
    'gastrocnemius': '비복근',
    'gluteus': '둔근', 'gluteal': '둔근',

    // === Z-Anatomy 329개 메시 명 덤프 기반 (2026-09-30) — 추가 매핑 320개 ===
    'parietal bone': '두정골',
    'frontal bone': '전두골',
    'occipital bone': '후두골',
    'sphenoid bone': '나비뼈',
    'temporal bone': '관자뼈',
    'ethmoid bone': '사골',
    'nasal bone': '코뼈',
    'lacrimal bone': '눈물뼈',
    'inferior nasal concha': '아래코선반',
    'zygomatic bone': '광대뼈',
    'palatine bone': '구개뼈',
    'maxilla': '위턱뼈',
    'hyoid bone': '설골',
    'scapula': '견갑골',
    'humerus': '상완골',
    'radius (bone': '요골',
    'ulna': '자뼈',
    'capitate bone': '유두골',
    'hamate bone': '갈고리뼈',
    'lunate bone': '반달뼈',
    'pisiform bone': '완두뼈',
    'scaphoid bone': '주상골',
    'trapezium (bone': '대능형골',
    'trapezoid bone': '소능형골',
    'triquetral bone': '삼각골',
    'metacarpal bones': '중수골',
    'body of sternum': '흉골체',
    'manubrium of sternum': '흉골병',
    'xiphoid process': '검상돌기',
    'first rib': '제1늑골',
    'second rib': '제2늑골',
    'eleventh rib': '제11늑골',
    'twelfth rib': '제12늑골',
    'costal cartilage of first rib': '제1늑골 늑연골',
    'costal cartilage of second rib': '제2늑골 늑연골',
    'costal cartilage of third rib': '제3늑골 늑연골',
    'costal cartilage of fourth rib': '제4늑골 늑연골',
    'costal cartilage of fifth rib': '제5늑골 늑연골',
    'costal cartilage of sixth rib': '제6늑골 늑연골',
    'costal cartilage of seventh rib': '제7늑골 늑연골',
    'costal cartilage of eighth rib': '제8늑골 늑연골',
    'costal cartilage of ninth rib': '제9늑골 늑연골',
    'costal cartilage of tenth rib': '제10늑골 늑연골',
    'thoracic vertebrae': '흉추',
    'lumbar vertebrae': '요추',
    'cervical vertebrae': '경추',
    'hip bone': '둔골',
    'talus bone': '거골',
    'calcaneus': '종골',
    'navicular bone': '쥐뼈',
    'cuboid bone': '입방골',
    'cuneiform bones': '설상골',
    'metatarsal bones': '중족골',
    'sesamoid bone': '종자뼈',
    'sesamoid bones of foot': '발 종자뼈',
    'first metatarsal bone': '제1중족골',
    'second metatarsal bone': '제2중족골',
    'third metatarsal bone': '제3중족골',
    'fourth metatarsal bone': '제4중족골',
    'fifth metatarsal bone': '제5중족골',
    'first metacarpal bone': '제1중수골',
    'second metacarpal bone': '제2중수골',
    'third metacarpal bone': '제3중수골',
    'fourth metacarpal bone': '제4중수골',
    'fifth metacarpal bone': '제5중수골',
    'vomer': '벌집뼈',
    'incus': '침골',
    'malleus': '추골',
    'stapes': '등골',
    'atlas (anatomy': '제1경추 (환추)',
    'axis (anatomy': '제2경추 (축추)',
    'temporoparietalis': '측두두정근',
    'nasalis': '비근',
    'procerus': '미간근',
    'frontalis': '전두근',
    'occipitalis': '후두근',
    'platysma': '광경근',
    'brachioradialis': '상완요골근',
    'orbicularis oculi': '안륜근',
    'orbicularis oris': '구륜근',
    'psoas major': '대요근',
    'ary-epiglottic part of oblique arytenoid': '모뿔빗근의 모뿔-바닥판 부분',
    'oblique head of adductor hallucis': '엄지내전근 빗갈래',
    'transverse head of adductor hallucis': '엄지내전근 가로갈래',
    'corrugator supercilii': '눈썹주름근',
    'depressor septi nasi': '콧구멍내림근',
    'levator labii superioris': '윗입술올림근',
    'levator labii superioris alaeque nasi': '윗입술콧방울올림근',
    'levator anguli oris': '입꼬리올림근',
    'zygomaticus major': '대관골근',
    'zygomaticus minor': '소관골근',
    'risorius': '입꼬리당김근',
    'depressor anguli oris': '입꼬리내림근',
    'depressor labii inferioris': '아랫입술내림근',
    'mentalis': '턱끝근',
    'buccinator': '볼근',
    'masseter': '교근',
    'temporalis': '측두근',
    'medial pterygoid': '내쪽날개근',
    'lateral pterygoid': '가쪽날개근',
    'levator palpebrae superioris': '위눈꺼풀올림근',
    'superior rectus': '위직근',
    'inferior rectus': '아래직근',
    'medial rectus': '안쪽직근',
    'lateral rectus': '가쪽직근',
    'superior oblique': '위빗근',
    'inferior oblique': '아래빗근',
    'palatopharyngeus': '구개인두근',
    'stylopharyngeus': '바늘인두근',
    'superior pharyngeal constrictor': '위인두수축근',
    'middle pharyngeal constrictor': '중간인두수축근',
    'inferior pharyngeal constrictor': '아래인두수축근',
    'lateral crico-arytenoid': '외측윤상모뿔근',
    'posterior crico-arytenoid': '후윤상모뿔근',
    'transverse arytenoid': '가로모뿔근',
    'thyro-arytenoid': '방패모뿔근',
    'genioglossus': '턱끝혀근',
    'hyoglossus': '설골혀근',
    'geniohyoid': '턱끝설골근',
    'mylohyoid': '이틀근',
    'stylohyoid': '바늘설골근',
    'digastric': '이복근',
    'sternocleidomastoid': '흉쇄유돌근',
    'omohyoid': '견갑설골근',
    'sternohyoid': '흉골설골근',
    'sternothyroid': '흉골갑상근',
    'thyrohyoid': '갑상설골근',
    'iliocostalis': '장늑근',
    'longissimus': '최장근',
    'spinalis': '극근',
    'multifidus': '다열근',
    'multifidus lumborum': '다열근 (요부)',
    'multifidus thoracis': '다열근 (흉부)',
    'semispinalis muscles': '반극근',
    'splenius capitis': '판상근 (머리)',
    'splenius cervicis': '판상근 (목)',
    'rotatores muscles': '회전근',
    'interspinales muscles': '극간근',
    'levatores costarum muscles': '늑골올림근',
    'levatores longi costarum': '긴늑골올림근',
    'scalene muscles': '사각근',
    'longus capitis': '머리긴근',
    'longus colli': '목긴근',
    'rectus anterior capitis': '전두직근',
    'rectus capitis posterior major': '큰후두직근',
    'rectus capitis posterior minor': '작은후두직근',
    'rectus lateralis capitis': '외측두직근',
    'obliquus capitis inferior': '아래빗머리근',
    'obliquus capitis superior': '위빗머리근',
    'trapezius': '승모근',
    'rhomboid major': '대능형근',
    'rhomboid minor': '소능형근',
    'levator scapulae': '견갑거근',
    'latissimus dorsi': '광배근',
    'serratus anterior': '전거근',
    'serratus posterior superior': '상후거근',
    'serratus posterior inferior': '하후거근',
    'pectoralis major': '대흉근',
    'pectoralis minor': '소흉근',
    'subclavius': '쇄골하근',
    'thoracic diaphragm': '가로막',
    'transversus thoracis': '흉횡근',
    'external intercostal muscles': '외늑간근',
    'internal intercostal muscles': '내늑간근',
    'innermost intercostal': '최내늑간근',
    'rectus abdominis': '복직근',
    'abdominal external oblique': '외복사근',
    'abdominal internal oblique': '내복사근',
    'transverse abdominal': '복횡근',
    'pyramidalis': '추체근',
    'quadratus lumborum': '요방형근',
    'linea alba (abdomen': '백선 (복부)',
    'deltoid': '삼각근',
    'subscapularis': '견갑하근',
    'supraspinatus': '극상근',
    'infraspinatus': '극하근',
    'teres major': '대원근',
    'teres minor': '소원근',
    'triceps': '상완삼두근',
    'short head of biceps brachii': '상완이두근 짧은갈래',
    'short head of biceps femoris': '대퇴이두근 짧은갈래',
    'brachialis': '상완근',
    'coracobrachialis': '오훼상완근',
    'anconeus': '주근',
    'pronator teres': '원형회내근',
    'pronator quadratus': '사각회내근',
    'supinator': '회외근',
    'flexor carpi radialis': '요측수근굴근',
    'flexor carpi ulnaris': '자측수근굴근',
    'extensor carpi radialis brevis': '짧은요측수근신근',
    'extensor carpi radialis longus': '긴요측수근신근',
    'palmaris longus': '긴손바닥근',
    'flexor digitorum superficialis': '지굴근 (천층)',
    'flexor digitorum profundus': '지굴근 (심층)',
    'flexor digitorum longus': '긴지굴근',
    'flexor pollicis longus': '긴엄지굴근',
    'flexor pollicis brevis': '짧은엄지굴근',
    'extensor digitorum': '지신근',
    'extensor digitorum longus': '긴지신근',
    'extensor indicis': '집게손가락신근',
    'extensor pollicis longus': '긴엄지신근',
    'extensor pollicis brevis': '짧은엄지신근',
    'extensor hallucis longus': '긴엄지발가락신근',
    'extensor digiti minimi': '새끼손가락신근',
    'abductor pollicis longus': '긴엄지외전근',
    'abductor pollicis brevis': '짧은엄지외전근',
    'adductor pollicis': '엄지내전근',
    'opponens pollicis': '엄지맞섬근',
    'opponens digiti minimi muscle of hand': '새끼손가락맞섬근',
    'abductor digiti minimi muscle of hand': '새끼손가락외전근',
    'flexor digiti minimi brevis muscle (hand': '짧은새끼손가락굴근 (손)',
    'dorsal interossei of the hand': '등쪽골간근 (손)',
    'palmar interossei muscles': '손바닥쪽골간근',
    'lumbricals of the hand': '충양근 (손)',
    'iliacus': '장골근',
    'gluteus maximus': '대둔근',
    'gluteus medius': '중둔근',
    'gluteus minimus': '소둔근',
    'gemelli muscles': '쌍자근',
    'piriformis': '이상근',
    'obturator internus': '내폐쇄근',
    'obturator externus': '외폐쇄근',
    'quadratus femoris': '대퇴방형근',
    'tensor fasciae latae': '대퇴근막장근',
    'quadriceps femoris': '대퇴사두근',
    'rectus femoris': '대퇴직근',
    'vastus lateralis': '외측광근',
    'vastus medialis': '내측광근',
    'vastus intermedius': '중간광근',
    'sartorius': '봉공근',
    'pectineus': '치골근',
    'gracilis': '박근',
    'adductor longus': '긴내전근',
    'adductor brevis': '짧은내전근',
    'adductor magnus': '대내전근',
    'biceps femoris': '대퇴이두근',
    'semitendinosus': '반건양근',
    'semimembranosus': '반막양근',
    'tibialis anterior': '전경골근',
    'tibialis posterior': '후경골근',
    'fibularis tertius': '제3비골근',
    'fibularis longus': '긴비골근',
    'fibularis brevis': '짧은비골근',
    'peroneus longus': '긴비골근',
    'peroneus brevis': '짧은비골근',
    'soleus': '가자미근',
    'plantaris': '족척근',
    'popliteus': '오금근',
    'thyroid cartilage': '갑상연골',
    'cricoid cartilage': '윤상연골',
    'arytenoid cartilage': '모뿔연골',
    'corniculate cartilage': '작은모뿔연골',
    'nasal cartilages': '비연골',
    'lateral nasal cartilage': '외측비연골',
    'major alar cartilage': '큰콧방울연골',
    'temporal': '관자',
    'incisor': '절치',
    'canine tooth': '견치',
    'premolar': '소구치',
    'molar (tooth': '대구치',
    'anserine bursa': '안세리누 점액낭',
    'bicipitoradial bursa': '상완이두점액낭',
    'coracobrachial bursa': '오훼상완 점액낭',
    'deep infrapatellar bursa': '깊은슬개하 점액낭',
    'iliopectineal bursa': '장골치골 점액낭',
    'inferior subtendinous bursa of biceps femoris': '대퇴이두근 아래힘줄밑 점액낭',
    'intermuscular gluteal bursae': '둔근사이 점액낭',
    'lateral subtendinous bursa of gastrocnemius': '비복근 가쪽힘줄밑 점액낭',
    'medial subtendinous bursa of gastrocnemius': '비복근 안쪽힘줄밑 점액낭',
    'sciatic bursa of gluteus maximus': '대둔근 좌골 점액낭',
    'sciatic bursa of obturator internus': '내폐쇄근 좌골 점액낭',
    'semimembranosus bursa': '반막양근 점액낭',
    'subacromial bursa': '견봉하 점액낭',
    'subcutaneous acromial bursa': '견봉피하 점액낭',
    'subcutaneous bursa of lateral malleolus': '가쪽복사피하 점액낭',
    'subcutaneous bursa of medial malleolus': '안쪽복사피하 점액낭',
    'subcutaneous bursa of tuberosity of tibia': '경골거친면피하 점액낭',
    'subcutaneous calcaneal bursa': '종골피하 점액낭',
    'subcutaneous infrapatellar bursa': '슬개하피하 점액낭',
    'subcutaneous prepatellar bursa': '슬개전피하 점액낭',
    'subcutaneous trochanteric bursa': '대퇴돌기피하 점액낭',
    'subdeltoid bursa': '삼각근하 점액낭',
    'subfacial prepatellar bursa': '슬개전근막하 점액낭',
    'subtendinous bursa of iliacus': '장골근힘줄밑 점액낭',
    'subtendinous bursa of infraspinatus': '극하근힘줄밑 점액낭',
    'subtendinous bursa of obturator internus': '내폐쇄근힘줄밑 점액낭',
    'subtendinous bursa of sartorius': '봉공근힘줄밑 점액낭',
    'subtendinous bursa of teres major': '대원근힘줄밑 점액낭',
    'subtendinous bursa of tibialis anterior': '전경골근힘줄밑 점액낭',
    'subtendinous bursa of trapezius': '승모근힘줄밑 점액낭',
    'subtendinous bursa of triceps brachii': '상완삼두근힘줄밑 점액낭',
    'subtendinous calcaneal bursa': '종골힘줄밑 점액낭',
    'subtendinous prepatellar bursa': '슬개전힘줄밑 점액낭',
    'superior bursa of biceps femoris': '대퇴이두근 위 점액낭',
    'suprapatellar bursa': '슬개상 점액낭',
    'trochanteric bursa of gluteus maximus': '대둔근 대퇴돌기 점액낭',
    'trochanteric bursa of gluteus medius': '중둔근 대퇴돌기 점액낭',
    'trochanteric bursa of gluteus minimus': '소둔근 대퇴돌기 점액낭',
    'bursa of piriformis': '이상근 점액낭',
    'humeral head of extensor carpi ulnaris': '자측수근신근 상완머리',
    'humeral head of flexor carpi ulnaris': '자측수근굴근 상완머리',
    'humero-ulnar head of flexor digitorum superficialis': '지굴근(천층) 상완자머리',
    'ulnar head of extensor carpi ulnaris': '자측수근신근 자뼈머리',
    'ulnar head of flexor carpi ulnaris': '자측수근굴근 자뼈머리',
    'common flexor tendon sheath': '공통굴근힘줄집',
    'common tendinous ring': '공통힘줄고리',
    'common tendon sheath of fibularis muscles': '비골근 공통힘줄집',
    'plantar tendon sheath of fibularis longus': '긴비골근 발바닥힘줄집',
    'tendon sheath - abd': '힘줄집 (복부)',
    'tendon sheath of extensor carpi ulnaris': '자측수근신근 힘줄집',
    'tendon sheath of extensor digiti minimi manus': '새끼손가락신근 힘줄집',
    'tendon sheath of extensor digitorum and extensor indicis': '지신근·집게손가락신근 힘줄집',
    'tendon sheath of extensor digitorum longus': '긴지신근 힘줄집',
    'tendon sheath of extensor hallucis longus': '긴엄지발가락신근 힘줄집',
    'tendon sheath of extensor pollicis longus': '긴엄지신근 힘줄집',
    'tendon sheath of extensors carpi radialis': '요측수근신근 힘줄집',
    'tendon sheath of flexor carpi radialis': '요측수근굴근 힘줄집',
    'tendon sheath of flexor digitorum longus': '긴지굴근 힘줄집',
    'tendon sheath of flexor hallucis longus': '긴엄지발가락굴근 힘줄집',
    'tendon sheath of flexor pollicis longus': '긴엄지굴근 힘줄집',
    'tendon sheath of tibialis anterior': '전경골근 힘줄집',
    'tendon sheath of tibialis posterior': '후경골근 힘줄집',
    'intertubercular tendon sheath': '결절사이힘줄집',
    'cruciform part of fibrous sheath of digit of hand': '손가락섬유집 십자부분',
    'synovial sheaths of digits of hand': '손가락 윤활집',
    'dorsal parts of lateral intertransversarii lumborum muscles': '가로돌기사이근 등쪽 (요부)',
    'ventral parts of lateral intertransversarii lumborum muscles': '가로돌기사이근 배쪽 (요부)',
    'epicranial aponeurosis': '머리널힘줄',
    'external obturator': '외폐쇄근',
    'internal obturator': '내폐쇄근',
    'flexor hallucis longus': '긴엄지발가락굴근',

    // === 5차 추가 매핑 (2026-09-30, nameDetail 434개 전수 조사 기반) ===
    'abductor digiti minimi of hand': '새끼손가락외전근',
    'atlas (c1)': '제1경추 (환추)',
    'axis (c2)': '제2경추 (축추)',

    // === 6차 추가 매핑 (2026-09-30, nameDetail 434개 - 5차 후 잔여 19개 + z-anatomy 단어 순서 변형) ===
    'dorsal interossei muscles of hand': '손등쪽골간근',
    'inferior gemellus': '아래쌍자근',
    'intermediate cuneiform': '중간설상골',
    'internal abdominal oblique': '내복사근',
    'interspinales colli': '목극간근',
    'interspinales lumborum': '요극간근',
    'interspinales thoracis': '흉극간근',
    'lateral cuneiform': '가쪽설상골',
    'lumbrical muscles of hand': '손충양근',
    'medial cuneiform': '안쪽설상골',
    'obliquus inferior capitis': '아래빗머리근',
    'obliquus superior capitis': '위빗머리근',
    'scalenus medius': '중사각근',
    'splenius colli': '목판상근',
    'superior gemellus': '위쌍자근',
    'transversus abdominis': '복횡근',
    'trapezium': '대능형골',
    'triquetrum': '삼각골',
    'bucinator': '볼근',
    'diaphragm': '가로막',
    'flexor digiti minimi of hand': '새끼손가락굴근',
    'inferior tarsus': '아래눈꺼풀판',
    'lateral process of nasal septal cartilage': '비중격연골 가쪽돌기',
    'levator nasolabialis': '비구순올림근',
    'levatores breves costarum': '짧은늑골올림근',
    'linea alba': '백선',
    'lower canine': '아래견치',
    'lower first molar tooth': '아래제1대구치',
    'lower second molar tooth': '아래제2대구치',
    'nasal septal cartilage': '비중격연골',
    'rotatores': '회전근',
    'superior tarsus': '위눈꺼풀판',
    'talus': '거골',
    'upper canine': '위견치',
    'upper first molar tooth': '위제1대구치',
    'upper second molar tooth': '위제2대구치',

    // === 4차 추가 매핑 (2026-09-30, formatAnatomyName 한글 (영문) 통일용) ===
    'muscle': '근',
    'tendon': '힘줄',
    'bursa': '점액낭',
    'bone': '뼈',
    'artery': '동맥',
    'vein': '정맥',
    'nerve': '신경',
    'ligament': '인대',
    'anterior belly': '앞배',
    'posterior belly': '뒤배',
    'intermediate tendon': '중간힘줄',
    'belly': '배',
    'anterior': '앞쪽',
    'posterior': '뒤쪽',
    'lateral head of flexor hallucis brevis': '짧은엄지발가락굴근 외측갈래',
    'medial head of flexor hallucis brevis': '짧은엄지발가락굴근 내측갈래',
    'thyroid': '갑상선', 'gallbladder': '담낭', 'gall bladder': '담낭',
    'adrenal': '부신', 'adrenal gland': '부신',
    'ureter': '요관', 'urethra': '요도',

    // === 3차 추가 매핑 (2026-09-30) ===
    'longissimus capitis': '머리최장근',
    'longissimus thoracis': '등최장근',
    'longissimus colli': '목최장근',
    'iliocostalis lumborum': '요장늑근',
    'iliocostalis thoracis': '흉장늑근',
    'iliocostalis colli': '경장늑근',
    'spinalis capitis': '머리극근',
    'spinalis colli': '목극근',
    'spinalis thoracis': '등극근',
    'cricothyroid': '윤상방패근',
    'longissimus#longissimus capitis': '머리최장근',
    'oblique part of cricothyroid': '윤상방패근 사선부분',
    'straight part of cricothyroid': '윤상방패근 직선부분',
    'thyro-epiglottic part of thyro-arytenoid': '방패모뿔근 갑상-후두개 부분',
    'external part of thyro-arytenoid': '방패모뿔근 외측부분',
    'ary-epiglottic part of oblique arytenoid': '빗모뿔근 모뿔-후두개 부분',
    'deep head of pronator teres': '원형회내근 깊은갈래',
    'superficial head of pronator teres': '원형회내근 얕은갈래',
    'short head of biceps brachii': '상완이두근 짧은갈래',
    'short head of biceps femoris': '대퇴이두근 짧은갈래',
    'rib cage': '늑골',
    'longissimus#longissimus': '최장근',
    'digastric muscle#intermediate tendon': '이복근 중간힘줄',
    'lateral head of flexor hallucis brevis': '짧은엄지발가락굴근 외측갈래',
    'medial head of flexor hallucis brevis': '짧은엄지발가락굴근 내측갈래',
    'oblique head of adductor hallucis': '엄지내전근 빗갈래',
    'transverse head of adductor hallucis': '엄지내전근 가로갈래',
    'cartilages': '연골들',
    'tarsus (eyelids': '눈꺼풀판',
    'corniculate cartilages': '작은모뿔연골들',
    'nasal cartilages': '비연골들',
    'costal cartilages': '늑연골들',
    'major alar cartilage': '큰콧방울연골',
    'lateral nasal cartilage': '외측비연골',
    'cuneiform cartilage': '설상연골',
    'cricoid cartilage': '윤상연골',
    'thyroid cartilage': '갑상연골',
    'arytenoid cartilage': '모뿔연골',
    'corniculate cartilage': '작은모뿔연골',
  };

  // 검색용 역방향 매핑 (한글 → 영문 별칭들)
  // 사용자가 "심장" 입력 시 'heart' 매핑 시도
  const KO_TO_ANATOMY = {
    '뇌': ['brain'],
    '심장': ['heart'],
    '폐': ['lung', 'lungs', 'trachea', 'bronchi'],
    '간': ['liver'],
    '신장': ['kidney', 'kidneys'],
    '비장': ['spleen'],
    '방광': ['bladder'],
    '소장': ['small intestine', 'small_intestine'],
    '췌장': ['pancreas'],
    '위': ['stomach'],
    '식도': ['esophagus'],
    '갑상선': ['thyroid'],
    '담낭': ['gallbladder', 'gall bladder'],
    '부신': ['adrenal'],
    '기관': ['trachea'], '기관지': ['bronchi', 'bronchus'],
    '요관': ['ureter'], '요도': ['urethra'],
    '두개골': ['skull', 'cranium'],
    '하악골': ['mandible'],
    '척추': ['vertebra', 'vertebrae', 'vertebral'],
    '척추뼈': ['vertebra', 'vertebrae'],
    '흉골': ['sternum'],
    '쇄골': ['clavicle', 'clavicles'],
    '견갑골': ['scapula', 'scapulae'],
    '상완골': ['humerus'],
    '요골': ['radius', 'radius (bone'],
    '자뼈': ['ulna'],
    '골반': ['pelvis', 'pelvic'],
    '장골': ['ilium'],
    '좌골': ['ischium'],
    '치골': ['pubis'],
    '천골': ['sacrum'],
    '미골': ['coccyx'],
    '대퇴골': ['femur', 'femoral'],
    '경골': ['tibia'],
    '비골': ['fibula'],
    '슬개골': ['patella'],
    '수근골': ['carpals', 'carpal'],
    '중수골': ['metacarpals', 'metacarpal', 'metacarpal bones'],
    '지골': ['phalanges', 'phalanx'],
    '족근골': ['tarsals', 'tarsal'],
    '중족골': ['metatarsals', 'metatarsal', 'metatarsal bones'],
    '늑골': ['rib', 'ribs', 'costal'],
    '척수': ['spinal cord'],
    '삼각근': ['deltoid'],
    '대흉근': ['pectoralis major', 'pectoralis'],
    '소흉근': ['pectoralis minor'],
    '광배근': ['latissimus', 'latissimus dorsi'],
    '승모근': ['trapezius'],
    '능형근': ['rhomboid major', 'rhomboid minor', 'rhomboid', 'rhomboids'],
    '견갑거근': ['levator scapulae'],
    '극상근': ['supraspinatus'],
    '극하근': ['infraspinatus'],
    '대원근': ['teres major'],
    '소원근': ['teres minor'],
    '견갑하근': ['subscapularis'],
    '상완이두근': ['biceps', 'short head of biceps brachii'],
    '상완삼두근': ['triceps'],
    '상완근': ['brachialis'],
    '오훼상완근': ['coracobrachialis'],
    '전거근': ['serratus anterior', 'serratus'],
    '복직근': ['rectus abdominis'],
    '외복사근': ['abdominal external oblique', 'external oblique'],
    '내복사근': ['abdominal internal oblique', 'internal oblique'],
    '복횡근': ['transverse abdominal', 'transversus abdominis', 'transversus'],
    '복사근': ['oblique'],
    '가로막': ['thoracic diaphragm', 'diaphragm'],
    '요방형근': ['quadratus lumborum'],
    '척추기립근': ['erector spinae', 'erector'],
    '다열근': ['multifidus', 'multifidus lumborum', 'multifidus thoracis'],
    '최장근': ['longissimus'],
    '극근': ['spinalis'],
    '장늑근': ['iliocostalis'],
    '대둔근': ['gluteus maximus'],
    '중둔근': ['gluteus medius'],
    '소둔근': ['gluteus minimus'],
    '둔근': ['gluteus', 'gluteal'],
    '대퇴사두근': ['quadriceps femoris', 'quadriceps'],
    '대퇴직근': ['rectus femoris'],
    '외측광근': ['vastus lateralis'],
    '내측광근': ['vastus medialis'],
    '중간광근': ['vastus intermedius'],
    '광근': ['vastus'],
    '햄스트링': ['hamstrings', 'hamstring'],
    '대퇴이두근': ['biceps femoris', 'short head of biceps femoris'],
    '반건양근': ['semitendinosus'],
    '반막양근': ['semimembranosus'],
    '봉공근': ['sartorius'],
    '내전근': ['adductor'],
    '긴내전근': ['adductor longus'],
    '대내전근': ['adductor magnus'],
    '짧은내전근': ['adductor brevis'],
    '박근': ['gracilis'],
    '치골근': ['pectineus'],
    '대퇴근막장근': ['tensor fasciae latae'],
    '비복근': ['gastrocnemius'],
    '가자미근': ['soleus'],
    '전경골근': ['tibialis anterior'],
    '후경골근': ['tibialis posterior'],
    '경골근': ['tibialis'],
    '비골근': ['fibularis', 'fibularis longus', 'fibularis brevis', 'peroneus', 'peroneus longus', 'peroneus brevis'],
    '긴비골근': ['fibularis longus', 'peroneus longus'],
    '짧은비골근': ['fibularis brevis', 'peroneus brevis'],
    '지신근': ['extensor digitorum'],
    '긴지신근': ['extensor digitorum longus'],
    '지굴근': ['flexor digitorum'],
    '아킬레스건': ['achilles'],
    '흉쇄유돌근': ['sternocleidomastoid'],
    '광경근': ['platysma'],
    '교근': ['masseter'],
    '측두근': ['temporalis'],
    '볼근': ['buccinator'],
    '안륜근': ['orbicularis oculi'],
    '구륜근': ['orbicularis oris'],
    '전두근': ['frontalis'],
    '후두근': ['occipitalis'],

    // === Z-Anatomy 329개 메시 명 기반 추가 매핑 (2026-09-30) ===
    '두정골': ['parietal bone'],
    '전두골': ['frontal bone'],
    '후두골': ['occipital bone'],
    '나비뼈': ['sphenoid bone'],
    '관자뼈': ['temporal bone'],
    '사골': ['ethmoid bone'],
    '코뼈': ['nasal bone'],
    '눈물뼈': ['lacrimal bone'],
    '아래코선반': ['inferior nasal concha'],
    '광대뼈': ['zygomatic bone'],
    '구개뼈': ['palatine bone'],
    '위턱뼈': ['maxilla'],
    '설골': ['hyoid bone'],
    '유두골': ['capitate bone'],
    '갈고리뼈': ['hamate bone'],
    '반달뼈': ['lunate bone'],
    '완두뼈': ['pisiform bone'],
    '주상골': ['scaphoid bone'],
    '대능형골': ['trapezium (bone'],
    '소능형골': ['trapezoid bone'],
    '삼각골': ['triquetral bone'],
    '흉골체': ['body of sternum'],
    '흉골병': ['manubrium of sternum'],
    '검상돌기': ['xiphoid process'],
    '제1늑골': ['first rib'],
    '제2늑골': ['second rib'],
    '제11늑골': ['eleventh rib'],
    '제12늑골': ['twelfth rib'],
    '흉추': ['thoracic vertebrae'],
    '요추': ['lumbar vertebrae'],
    '경추': ['cervical vertebrae'],
    '둔골': ['hip bone'],
    '거골': ['talus bone'],
    '종골': ['calcaneus'],
    '쥐뼈': ['navicular bone'],
    '입방골': ['cuboid bone'],
    '설상골': ['cuneiform bones'],
    '종자뼈': ['sesamoid bone', 'sesamoid bones of foot'],
    '벌집뼈': ['vomer'],
    '침골': ['incus'],
    '추골': ['malleus'],
    '등골': ['stapes'],
    '제1경추': ['atlas (anatomy'],
    '환추': ['atlas (anatomy'],
    '제2경추': ['axis (anatomy'],
    '축추': ['axis (anatomy'],
    '측두두정근': ['temporoparietalis'],
    '비근': ['nasalis'],
    '미간근': ['procerus'],
    '눈썹주름근': ['corrugator supercilii'],
    '콧구멍내림근': ['depressor septi nasi'],
    '윗입술올림근': ['levator labii superioris'],
    '윗입술콧방울올림근': ['levator labii superioris alaeque nasi'],
    '입꼬리올림근': ['levator anguli oris'],
    '대관골근': ['zygomaticus major'],
    '소관골근': ['zygomaticus minor'],
    '입꼬리당김근': ['risorius'],
    '입꼬리내림근': ['depressor anguli oris'],
    '아랫입술내림근': ['depressor labii inferioris'],
    '턱끝근': ['mentalis'],
    '내쪽날개근': ['medial pterygoid'],
    '가쪽날개근': ['lateral pterygoid'],
    '위눈꺼풀올림근': ['levator palpebrae superioris'],
    '위직근': ['superior rectus'],
    '아래직근': ['inferior rectus'],
    '안쪽직근': ['medial rectus'],
    '가쪽직근': ['lateral rectus'],
    '위빗근': ['superior oblique'],
    '아래빗근': ['inferior oblique'],
    '구개인두근': ['palatopharyngeus'],
    '바늘인두근': ['stylopharyngeus'],
    '위인두수축근': ['superior pharyngeal constrictor'],
    '중간인두수축근': ['middle pharyngeal constrictor'],
    '아래인두수축근': ['inferior pharyngeal constrictor'],
    '외측윤상모뿔근': ['lateral crico-arytenoid'],
    '후윤상모뿔근': ['posterior crico-arytenoid'],
    '가로모뿔근': ['transverse arytenoid'],
    '방패모뿔근': ['thyro-arytenoid'],
    '턱끝혀근': ['genioglossus'],
    '설골혀근': ['hyoglossus'],
    '턱끝설골근': ['geniohyoid'],
    '이틀근': ['mylohyoid'],
    '바늘설골근': ['stylohyoid'],
    '이복근': ['digastric'],
    '견갑설골근': ['omohyoid'],
    '흉골설골근': ['sternohyoid'],
    '흉골갑상근': ['sternothyroid'],
    '갑상설골근': ['thyrohyoid'],
    '반극근': ['semispinalis muscles'],
    '판상근': ['splenius capitis', 'splenius cervicis'],
    '회전근': ['rotatores muscles'],
    '극간근': ['interspinales muscles'],
    '늑골올림근': ['levatores costarum muscles', 'levatores longi costarum'],
    '사각근': ['scalene muscles'],
    '머리긴근': ['longus capitis'],
    '목긴근': ['longus colli'],
    '전두직근': ['rectus anterior capitis'],
    '큰후두직근': ['rectus capitis posterior major'],
    '작은후두직근': ['rectus capitis posterior minor'],
    '외측두직근': ['rectus lateralis capitis'],
    '아래빗머리근': ['obliquus capitis inferior'],
    '위빗머리근': ['obliquus capitis superior'],
    '대능형근': ['rhomboid major'],
    '소능형근': ['rhomboid minor'],
    '상후거근': ['serratus posterior superior'],
    '하후거근': ['serratus posterior inferior'],
    '쇄골하근': ['subclavius'],
    '흉횡근': ['transversus thoracis'],
    '외늑간근': ['external intercostal muscles'],
    '내늑간근': ['internal intercostal muscles'],
    '최내늑간근': ['innermost intercostal'],
    '추체근': ['pyramidalis'],
    '백선': ['linea alba (abdomen'],
    '주근': ['anconeus'],
    '원형회내근': ['pronator teres'],
    '사각회내근': ['pronator quadratus'],
    '회외근': ['supinator'],
    '요측수근굴근': ['flexor carpi radialis'],
    '자측수근굴근': ['flexor carpi ulnaris'],
    '긴요측수근신근': ['extensor carpi radialis longus'],
    '짧은요측수근신근': ['extensor carpi radialis brevis'],
    '긴손바닥근': ['palmaris longus'],
    '긴엄지굴근': ['flexor pollicis longus'],
    '짧은엄지굴근': ['flexor pollicis brevis'],
    '긴엄지신근': ['extensor pollicis longus'],
    '짧은엄지신근': ['extensor pollicis brevis'],
    '긴엄지외전근': ['abductor pollicis longus'],
    '짧은엄지외전근': ['abductor pollicis brevis'],
    '엄지내전근': ['adductor pollicis'],
    '엄지맞섬근': ['opponens pollicis'],
    '새끼손가락맞섬근': ['opponens digiti minimi muscle of hand'],
    '새끼손가락외전근': ['abductor digiti minimi muscle of hand'],
    '충양근': ['lumbricals of the hand'],
    '쌍자근': ['gemelli muscles'],
    '이상근': ['piriformis'],
    '내폐쇄근': ['obturator internus', 'internal obturator'],
    '외폐쇄근': ['obturator externus', 'external obturator'],
    '대퇴방형근': ['quadratus femoris'],
    '제3비골근': ['fibularis tertius'],
    '족척근': ['plantaris'],
    '오금근': ['popliteus'],
    '갑상연골': ['thyroid cartilage'],
    '윤상연골': ['cricoid cartilage'],
    '모뿔연골': ['arytenoid cartilage'],
    '작은모뿔연골': ['corniculate cartilage'],
    '비연골': ['nasal cartilages'],
    '외측비연골': ['lateral nasal cartilage'],
    '큰콧방울연골': ['major alar cartilage'],
    '관자': ['temporal'],
    '절치': ['incisor'],
    '견치': ['canine tooth'],
    '소구치': ['premolar'],
    '대구치': ['molar (tooth'],
    '장골근': ['iliacus'],
    '머리널힘줄': ['epicranial aponeurosis'],
    '긴엄지발가락굴근': ['flexor hallucis longus'],
    '긴엄지발가락신근': ['extensor hallucis longus'],
    '집게손가락신근': ['extensor indicis'],
    '새끼손가락신근': ['extensor digiti minimi']
  };

  // 디버그 노출: 매핑 미스 보고를 위한 hook
  if (typeof window !== 'undefined') {
    window.__edusimAnatomy = { ANATOMY_NAME_KO, KO_TO_ANATOMY };
  }

  // 장기는 Z-Anatomy 모델에 없으므로 좌표가 필요 없습니다 — 메시 분류만 수행.
  const meshCollections = {
    muscles: [],
    bones: [],
    organs: [],
    all: []
  };

  // Track layer visibility
  const layerVisibility = { muscles: true, bones: true };

  // Original materials for restore
  const originalMaterials = new Map();

  // Floating labels
  const floatingLabels = [];
  let inspectedParts = new Set();

  function init(sceneRef) {
    scene = sceneRef;
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    buildEnvironment();
    loadModel();
    registerHUD();

    const canvas = document.getElementById('sim-canvas');
    canvas.addEventListener('click', onBodyClick);
    canvas.addEventListener('mousemove', onBodyHover);

    // Camera — positioned for full body view
    const camera = SceneManager.getCamera();
    camera.position.set(0, 1.0, 3.2);
    camera.lookAt(0, 0.85, 0);
    const controls = SceneManager.getControls();
    if (controls) {
      controls.target.set(0, 0.85, 0);
      controls.minDistance = 0.5;
      controls.maxDistance = 6;
      controls.update();
    }
  }

  function buildEnvironment() {
    // Dark medical floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x060a12, roughness: 0.95 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    scene.add(floor);

    // Subtle grid
    const grid = new THREE.GridHelper(30, 60, 0x0d1a2d, 0x080e18);
    grid.position.y = -0.04;
    scene.add(grid);

    // Display pedestal
    const platGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.04, 64);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.2 });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.y = -0.02;
    scene.add(platform);

    // Glow ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.012, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // Enhanced lighting for anatomical viewing
    const keyLight = new THREE.DirectionalLight(0xfff5ee, 1.0);
    keyLight.position.set(3, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc8d8f0, 0.4);
    fillLight.position.set(-3, 4, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x3b82f6, 0.5, 10);
    rimLight.position.set(-2, 3, -3);
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0x22d3ee, 0.2, 5);
    bottomLight.position.set(0, 0.1, 0);
    scene.add(bottomLight);

    // Hemisphere light for ambient fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1a1a2e, 0.4);
    scene.add(hemiLight);
  }

  function loadModel() {
    // Show loading overlay
    const container = document.getElementById('sim-canvas-container');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'model-loading-overlay';
    loadingEl.id = 'model-loading';
    loadingEl.innerHTML = `
      <div class="loading-text">3D 인체 해부 모델을 불러오는 중...</div>
      <div class="model-loading-bar"><div class="model-loading-bar-fill" id="model-progress"></div></div>
      <div class="loading-text" id="model-progress-text" style="font-size: 0.75rem; opacity: 0.6">0%</div>
    `;
    if (container) container.appendChild(loadingEl);

    // Setup DRACO decoder - use Google's CDN (recommended by Three.js)
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      'models/body.glb',
      (gltf) => onModelLoaded(gltf),
      (progress) => {
        if (progress.total > 0) {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          const bar = document.getElementById('model-progress');
          const text = document.getElementById('model-progress-text');
          if (bar) bar.style.width = pct + '%';
          if (text) text.textContent = pct + '%';
        }
      },
      (error) => {
        console.error('인체 해부 모델을 불러오지 못했습니다:', error);
        const loadEl = document.getElementById('model-loading');
        if (loadEl) {
          loadEl.querySelector('.loading-text').textContent = '모델을 불러오지 못했습니다. 페이지를 새로 고침해 주세요.';
        }
      }
    );
  }

  function onModelLoaded(gltf) {
    bodyGroup = gltf.scene;

    // Scale and position the model appropriately
    const box = new THREE.Box3().setFromObject(bodyGroup);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Scale to fit nicely (target ~2 units tall)
    const targetHeight = 2.0;
    const scale = targetHeight / size.y;
    bodyGroup.scale.setScalar(scale);

    // Center horizontally and place feet on platform
    bodyGroup.position.x = -center.x * scale;
    bodyGroup.position.z = -center.z * scale;
    bodyGroup.position.y = -(box.min.y * scale);

    scene.add(bodyGroup);

    // Classify meshes by type using embedded metadata
    bodyGroup.traverse((child) => {
      if (child.isMesh) {
        child.userData.clickable = true;
        meshCollections.all.push(child);

        // CRITICAL: Clone material per-mesh so each is independent.
        // GLTF models share material instances — without this, changing
        // opacity/emissive on one mesh affects ALL meshes using that material.
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 1.0;

        // Store the cloned original for restore
        originalMaterials.set(child, child.material.clone());

        // Classify by userData type (from Z-Anatomy metadata)
        const meshType = (child.userData.type || '').toLowerCase();
        const meshName = (child.name || '').toLowerCase();

        if (meshType === 'muscle' || meshName.includes('muscle') || meshName.includes('muscl')) {
          meshCollections.muscles.push(child);
          child.userData.anatomyType = 'muscle';
        } else if (meshType === 'bone' || meshName.includes('bone') || meshName.includes('skel') ||
                   meshName.includes('rib') || meshName.includes('vertebr') || meshName.includes('femur') ||
                   meshName.includes('tibia') || meshName.includes('fibula') || meshName.includes('humer') ||
                   meshName.includes('radius') || meshName.includes('ulna') || meshName.includes('pelvi') ||
                   meshName.includes('scapula') || meshName.includes('clav') || meshName.includes('skull') ||
                   meshName.includes('cranium') || meshName.includes('mandib') || meshName.includes('sternum') ||
                   meshName.includes('patella') || meshName.includes('carp') || meshName.includes('tars') ||
                   meshName.includes('metacarp') || meshName.includes('metatars') || meshName.includes('phalanx') ||
                   meshName.includes('sacr') || meshName.includes('coccyx') || meshName.includes('ilium') ||
                   meshName.includes('ischium') || meshName.includes('pubis')) {
          meshCollections.bones.push(child);
          child.userData.anatomyType = 'bone';
        } else {
          // Default to muscle if type metadata exists
          if (meshType) {
            meshCollections.muscles.push(child);
            child.userData.anatomyType = 'muscle';
          }
        }
      }
    });

    modelLoaded = true;

    // Remove loading overlay with fade
    const loadEl = document.getElementById('model-loading');
    if (loadEl) {
      loadEl.style.transition = 'opacity 0.5s ease';
      loadEl.style.opacity = '0';
      setTimeout(() => loadEl.remove(), 500);
    }

    // Create procedural organ meshes (the GLTF model only has muscles + bones)
    createOrganMeshes();

    // Click tooltip will be created on first click
    createClickTooltip();

    const totalMeshes = meshCollections.all.length;
    const muscleCount = meshCollections.muscles.length;
    const boneCount = meshCollections.bones.length;
    const organCount = meshCollections.organs.length;

    Notifications.success(
      '모델 불러오기 완료',
      `구조물 ${totalMeshes}개 (근육 ${muscleCount}개, 뼈 ${boneCount}개, 장기 ${organCount}개). 부위를 클릭하여 탐색해 보세요.`
    );

    Analytics.trackEvent('anatomy', 'model_loaded', { meshes: totalMeshes });
  }

  function createClickTooltip() {
    // Create a single reusable tooltip element that follows clicks
    if (clickTooltipEl) return;
    clickTooltipEl = document.createElement('div');
    clickTooltipEl.className = 'anatomy-click-tooltip';
    clickTooltipEl.style.display = 'none';
    document.body.appendChild(clickTooltipEl);
  }

  function showClickTooltip(mesh, hitPoint) {
    if (!clickTooltipEl) createClickTooltip();

    const rawName = mesh.userData.nameDetail || mesh.userData.name || mesh.name || 'Unknown';
    const displayName = formatAnatomyName(rawName);
    const type = mesh.userData.anatomyType || mesh.userData.type || 'structure';
    const typeEmoji = mesh.userData.organEmoji || (type === 'muscle' ? '💪' : type === 'bone' ? '🦴' : '🫀');
    const typeLabel = ANATOMY_TYPE_LABEL[type] || type;

    clickTooltipEl.innerHTML = `<span class="tooltip-emoji">${typeEmoji}</span><span class="tooltip-name">${displayName}</span><span class="tooltip-type">${typeLabel}</span>`;
    clickTooltipEl.style.display = 'flex';
    clickTooltipEl.classList.add('visible');

    // Store the 3D target so we can update screen position each frame
    clickTooltipTarget = hitPoint.clone();
    updateTooltipScreenPosition();

    // Auto-hide after 4 seconds
    if (clickTooltipEl._hideTimer) clearTimeout(clickTooltipEl._hideTimer);
    clickTooltipEl._hideTimer = setTimeout(() => {
      hideClickTooltip();
    }, 4000);
  }

  function hideClickTooltip() {
    if (!clickTooltipEl) return;
    clickTooltipEl.classList.remove('visible');
    setTimeout(() => {
      if (clickTooltipEl) clickTooltipEl.style.display = 'none';
    }, 300);
    clickTooltipTarget = null;
  }

  function updateTooltipScreenPosition() {
    if (!clickTooltipTarget || !clickTooltipEl || clickTooltipEl.style.display === 'none') return;

    const camera = SceneManager.getCamera();
    const canvas = document.getElementById('sim-canvas');
    if (!camera || !canvas) return;

    // Project the 3D point to 2D screen coordinates
    const projected = clickTooltipTarget.clone().project(camera);
    const rect = canvas.getBoundingClientRect();

    const x = ((projected.x + 1) / 2) * rect.width + rect.left;
    const y = ((-projected.y + 1) / 2) * rect.height + rect.top;

    // Position tooltip above the click point with a small offset
    clickTooltipEl.style.left = `${x}px`;
    clickTooltipEl.style.top = `${y - 50}px`;
  }

  /**
   * Load real anatomical organ GLTF models from HuBMAP CCF 3D Reference Library.
   * Source: Visual Human Male (CC BY 4.0) — scientifically vetted organ meshes.
   * Each organ is loaded from its own .glb file and positioned inside the body.
   */
  function createOrganMeshes() {
    const organDefs = [
      {
        file: 'models/organs/brain.glb',
        name: '뇌', emoji: '🧠',
        desc: '약 860억 개의 뉴런을 포함하고 있습니다. 모든 신체 기능, 사고, 기억, 감정을 조절합니다. 무게는 약 1.4kg입니다.',
        wiki: 'https://ko.wikipedia.org/wiki/뇌',
        color: 0xffaaaa
      },
      {
        file: 'models/organs/heart.glb',
        name: '심장', emoji: '❤️',
        desc: '순환계를 따라 혈액을 펌프질하는 근육 기관입니다. 하루 약 10만 회 박동하며, 약 7,500리터의 혈액을 내보냅니다.',
        wiki: 'https://ko.wikipedia.org/wiki/심장',
        color: 0xcc2233
      },
      {
        file: 'models/organs/lungs.glb',
        name: '폐 및 호흡기', emoji: '🫁',
        desc: '산소를 공급하고 이산화탄소를 제거하는 두 개의 스펀지 같은 기관입니다. 기관과 기관지 가지를 포함하며, 하루 약 11,000리터의 공기를 처리합니다.',
        wiki: 'https://ko.wikipedia.org/wiki/허파',
        color: 0xee8899
      },
      {
        file: 'models/organs/liver.glb',
        name: '간', emoji: '🫘',
        desc: '가장 큰 내부 장기(약 1.5kg)입니다. 혈액을 해독하고, 소화를 위한 담즙을 생성하며, 글리코겐을 저장하고 단백질을 합성합니다.',
        wiki: 'https://ko.wikipedia.org/wiki/간',
        color: 0x8b3520
      },
      {
        file: 'models/organs/kidney_left.glb',
        name: '왼쪽 신장', emoji: '🫘',
        desc: '매일 약 180리터의 혈액을 걸러 1~2리터의 소변을 만듭니다. 전해질, 혈압, pH 균형을 조절합니다.',
        wiki: 'https://ko.wikipedia.org/wiki/콩팥',
        color: 0x993333
      },
      {
        file: 'models/organs/kidney_right.glb',
        name: '오른쪽 신장', emoji: '🫘',
        desc: '간이 위치하기 때문에 왼쪽 신장보다 약간 낮게 자리합니다. 약 100만 개의 네프론(미세한 여과 단위)을 포함합니다.',
        wiki: 'https://ko.wikipedia.org/wiki/콩팥',
        color: 0x993333
      },
      {
        file: 'models/organs/spleen.glb',
        name: '비장', emoji: '🩸',
        desc: '혈액을 걸러 낡은 적혈구를 재활용하며, 면역 방어를 위한 백혈구와 혈소판을 보관합니다.',
        wiki: 'https://ko.wikipedia.org/wiki/지라',
        color: 0x772244
      },
      {
        file: 'models/organs/bladder.glb',
        name: '방광', emoji: '💧',
        desc: '배설 전 소변을 저장하는 빈 근육 기관입니다. 가득 찼을 때 400~600mL를 수용할 수 있습니다.',
        wiki: 'https://ko.wikipedia.org/wiki/방광',
        color: 0xddcc55
      },
      {
        file: 'models/organs/small_intestine.glb',
        name: '소장', emoji: '🔄',
        desc: '길이 약 6m이며, 거대한 내부 표면적(약 250m²)을 통해 음식물의 약 90% 영양소를 흡수합니다.',
        wiki: 'https://ko.wikipedia.org/wiki/작은창자',
        color: 0xffaa88
      },
      {
        file: 'models/organs/pancreas.glb',
        name: '췌장', emoji: '🔬',
        desc: '혈당을 조절하는 인슐린과 소화 효소를 분비합니다. 내분비 기관이자 외분비 기관입니다.',
        wiki: 'https://ko.wikipedia.org/wiki/이자',
        color: 0xddaa66
      }
    ];

    // Create a container group for all organs.
    // The HuBMAP VH_Male models are in meters with origin near the pelvis floor.
    // Our body model is Z-Anatomy, scaled to 2.0 units tall (feet at y=0).
    //
    // Key calibration points (organ model Y -> body world Y):
    //   Organ lung tops:  Y_organ = 0.70  -> should map to body Y ≈ 1.40 (chest top)
    //   Organ bladder:    Y_organ = 0.03  -> should map to body Y ≈ 0.80 (pelvis)
    //   Organ brain top:  Y_organ = 0.90  -> should map to body Y ≈ 1.85 (head)
    //
    // Scale = (1.40 - 0.80) / (0.70 - 0.03) = 0.60 / 0.67 ≈ 0.90 ... too small.
    // Better: just use scale = target_body_height_of_organ_region / organ_region_height
    // Organ span: brain_top(0.90) - bladder_bottom(0.01) = 0.89
    // Body span: head(1.85) - pelvis(0.75) = 1.10
    // Scale = 1.10 / 0.89 ≈ 1.24 ... but the body model is wider, so let's try ~1.25
    //
    // Y offset: body_pelvis_Y - (organ_bladder_Y * scale) = 0.75 - (0.01 * 1.25) = 0.74
    const organContainer = new THREE.Group();
    organContainer.name = 'organContainer';

    const organScale = 1.25;
    organContainer.scale.setScalar(organScale);
    organContainer.position.y = 0.88;
    organContainer.position.z = 0.0;

    organContainer.visible = false; // hidden by default
    scene.add(organContainer);

    // Store reference so toggleSeeInside can show/hide it
    meshCollections._organContainer = organContainer;

    const loader = new THREE.GLTFLoader();

    organDefs.forEach(def => {
      loader.load(def.file, (gltf) => {
        const organ = gltf.scene;
        organ.name = def.name;

        // Apply organ color tint and metadata to all child meshes
        organ.traverse(child => {
          if (child.isMesh) {
            // Use the GLTF node's original name for specific identification
            // (e.g. "VH_M_trachea" instead of just "Lungs")
            const meshSpecificName = child.name
              ? child.name.replace(/^VH_M_/i, '').replace(/_/g, ' ')
              : def.name;

            // Clone material for per-mesh independence
            child.material = child.material.clone();
            child.material.color = new THREE.Color(def.color);
            child.material.roughness = 0.6;
            child.material.metalness = 0.05;
            child.material.transparent = true;
            child.material.opacity = 1.0;
            child.material.side = THREE.DoubleSide;

            child.userData = {
              clickable: true,
              anatomyType: 'organ',
              name: meshSpecificName,
              nameDetail: meshSpecificName,
              organSystem: def.name,
              organDescription: def.desc,
              wikiLink: def.wiki,
              organEmoji: def.emoji
            };

            // Store original material for restore
            originalMaterials.set(child, child.material.clone());
            meshCollections.organs.push(child);
            meshCollections.all.push(child);
          }
        });

        organContainer.add(organ);
        console.log(`장기 로드 완료: ${def.name} (장기 메시 누적 ${meshCollections.organs.length}개)`);
      },
      undefined,
      (err) => console.warn(`장기를 불러올 수 없음: ${def.file}`, err));
    });
  }

  // === Public API: formatAnatomyName(raw) ===
  // 출력 형식: "한글 라벨 (영문 식별자)"
  //   매핑미스/메시 = 영문 식별자 그대로
  //   "#" 구분자 = 각 부분을 재귀 처리 후 " / " 연결
  function formatAnatomyName(raw) {
    const input = String(raw || '').trim();
    if (!input) return raw;

    // # 구분자 — Z-Anatomy가 일부 메시에 "A#B" 형태로 여러 구조 결합
    if (input.indexOf('#') !== -1) {
      const parts = input.split('#').map(p => p.trim()).filter(Boolean);
      const translated = parts.map(p => _fmtSingle(p)).filter(Boolean);
      if (translated.length > 0) return translated.join(' / ');
    }

    return _fmtSingle(input);
  }

  // === _fmtSingle: 단일 식별자 변환 ===
  //   1) 정확 일치 → "한글 (영문)"
  //   2) 가장 긴 키 우선 부분 일치 + 단/복수형 + "한글 (영문)"
  //   3) 폴백 — 매핑 미스 시 영문 식별자 그대로
  function _fmtSingle(raw) {
    const input = String(raw || '').trim();
    if (!input) return raw;
    const lower = input.toLowerCase();

    // 1) 정확 일치
    if (ANATOMY_NAME_KO[lower]) {
      const koLabel = ANATOMY_NAME_KO[lower];
      const ident = formatAnatomyId(input);
      // ident가 비어있지 않고 koLabel과 다르면 괄호 부착
      // 단, ident가 koLabel과 같아도 원본 입력과 다르면 (예: trim/괄호 정리된 경우) 부착
      if (ident && (ident !== koLabel || ident !== input.replace(/\s+/g, ' ').trim())) {
        return koLabel + ' (' + ident + ')';
      }
      return koLabel;
    }

    // 2) 부분 일치 (가장 긴 키 우선)
    //    단일 단어 suffix(muscle/bone/tendon/bursa/nerve/artery/vein/ligament/belly)는
    //    부분 일치 후보에서 제외 — 더 긴 매칭이 있으면 자동으로 trim됨
    const SUFFIX_WORDS = new Set(['muscle', 'bone', 'tendon', 'bursa', 'nerve',
                                   'artery', 'vein', 'ligament', 'belly']);
    const candidates = Object.keys(ANATOMY_NAME_KO)
      .filter(key => lower.indexOf(key) !== -1 && !SUFFIX_WORDS.has(key))
      .sort((a, b) => b.length - a.length);

    if (candidates.length > 0) {
      const bestKey = candidates[0];
      const koLabel = ANATOMY_NAME_KO[bestKey];
      let replaced = lower.replace(bestKey, koLabel)
        .replace(/\bleft\b/g, '왼쪽')
        .replace(/\bright\b/g, '오른쪽');
      // 단/복수형 's' 한국어화 (suffix 단어는 SKIP — 부분 매칭에서 제외됐기 때문)
      replaced = replaced.replace(/\b([a-z]+)s\b/g, (m, word) => {
        if (SUFFIX_WORDS.has(word)) return '';  // suffix 단어는 제거
        if (ANATOMY_NAME_KO[word]) {
          const ko = ANATOMY_NAME_KO[word];
          return /[을를들이]$/.test(ko) ? ko : (ko + '들');
        }
        return m;
      });
      // 표시명에서 불필요한 영어 suffix 단어 제거
      replaced = replaced.replace(/\b(muscle|bone|tendon|bursa|nerve|artery|vein|ligament|belly)s?\b/g, '');
      const cleaned = replaced.replace(/\s+/g, ' ').trim();
      if (cleaned) {
        const display = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        const ident = formatAnatomyId(input);
        if (ident && !/[가-힣]/.test(ident) && ident !== display) {
          return display + ' (' + ident + ')';
        }
        return display;
      }
    }

    // 3) 폴백 — 매핑 미스 시 식별자 그대로
    const fallback = input
      .replace(/\b(left|right|l|r)\b/gi, '')
      .replace(/\b(muscle|bone)s?\b/gi, '')
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return fallback || input;
  }

  // 식별자 영문 표기 — Z-Anatomy userData.name은 Title Case ("Femur Bone", "Adductor Magnus")
  // 좌/우 표준화 + 괄호/특수문자 정리
  function formatAnatomyId(raw) {
    let cleaned = String(raw || '').trim();
    // 괄호 짝 검증: 짝이 안 맞으면 (예: 'Atlas (C1') 모든 괄호 제거
    const openCount = (cleaned.match(/\(/g) || []).length;
    const closeCount = (cleaned.match(/\)/g) || []).length;
    if (openCount !== closeCount) {
      cleaned = cleaned.replace(/[()]/g, '');
    }
    // 괄호가 안 닫힌 식별자도 처리 (예: '(Foo' → 'Foo')
    // 이미 위에서 처리됨
    // 좌/우 표준화 (Left/Right)
    cleaned = cleaned.replace(/\b(left|right)\b/gi, m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
    // 밑줄 → 공백
    cleaned = cleaned.replace(/[_]+/g, ' ');
    // 연속 공백 정리
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    // 양끝 잔여 괄호/대괄호 반복 제거
    while (/^[\[\(]/.test(cleaned) || /[\]\)]$/.test(cleaned)) {
      cleaned = cleaned.replace(/^[\[\(]+/, '').replace(/[\]\)]+$/, '');
    }
    return cleaned;
  }

  /**
   * Get the real-world center of a mesh by computing its bounding box.
   * GLTF meshes often have position=(0,0,0) with geometry offset in vertices.
   */
  function getMeshCenter(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return center;
  }

  function focusOnMesh(mesh, hitPoint) {
    if (!mesh) return;

    const camera = SceneManager.getCamera();
    const controls = SceneManager.getControls();

    // Use raycast hit point if available, otherwise compute bounding box center
    const targetPos = hitPoint ? hitPoint.clone() : getMeshCenter(mesh);

    // Compute a camera position that looks at the target from a good angle
    // Keep the camera roughly where it is but zoom toward the target
    const currentDir = camera.position.clone().sub(controls.target).normalize();
    const meshBox = new THREE.Box3().setFromObject(mesh);
    const meshSize = meshBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(meshSize.x, meshSize.y, meshSize.z);
    // Distance = proportional to the size of the part, but with min/max bounds
    const viewDist = Math.max(0.4, Math.min(1.5, maxDim * 3));
    const newCamPos = targetPos.clone().add(currentDir.multiplyScalar(viewDist));

    // Simple lerp animation
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    let t = 0;
    const duration = 45; // frames (~0.75s at 60fps)

    function animateCamera() {
      t++;
      const progress = Math.min(t / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      camera.position.lerpVectors(startPos, newCamPos, eased);
      controls.target.lerpVectors(startTarget, targetPos, eased);
      controls.update();

      if (progress < 1) requestAnimationFrame(animateCamera);
    }
    requestAnimationFrame(animateCamera);

    // Show info about this mesh
    showMeshInfo(mesh);
    highlightMesh(mesh);

    // Show floating tooltip near the click point
    const tooltipPoint = hitPoint ? hitPoint.clone() : getMeshCenter(mesh);
    showClickTooltip(mesh, tooltipPoint);
  }

  function highlightMesh(mesh) {
    // Restore previous highlight first
    restoreAllMaterials();

    highlightedMesh = mesh;

    // 1. Gently dim other meshes (not too aggressive since materials are now per-mesh)
    meshCollections.all.forEach(m => {
      if (m !== mesh && m.visible && m.material) {
        m.material.opacity = 0.35;
      }
    });

    // 2. Make the selected mesh pop with bright emissive glow
    if (mesh.material) {
      mesh.material.opacity = 1.0;
      mesh.material.emissive = new THREE.Color(0x00ddff);
      mesh.material.emissiveIntensity = 0.8;
    }

    // Auto-restore after a few seconds
    if (highlightTimeout) clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      if (highlightedMesh === mesh) {
        restoreAllMaterials();
        highlightedMesh = null;
      }
    }, 4000);
  }

  function restoreAllMaterials() {
    meshCollections.all.forEach(m => {
      if (!m.material) return; // skip organ Groups
      m.material.opacity = 1.0;
      if (m.material.emissive) {
        m.material.emissive = new THREE.Color(0x000000);
        m.material.emissiveIntensity = 0;
      }
    });
  }

  function showMeshInfo(mesh) {
    const rawName = mesh.userData.nameDetail || mesh.userData.name || mesh.name || 'Unknown';
    const displayName = formatAnatomyName(rawName);
    const type = mesh.userData.anatomyType || mesh.userData.type || 'structure';
    const wikiLink = mesh.userData.wikiLink || `https://ko.wikipedia.org/wiki/${encodeURIComponent(rawName.replace(/_/g, ' '))}`;

    // Use organ-specific emoji and description if available
    const typeEmoji = mesh.userData.organEmoji || (type === 'muscle' ? '💪' : type === 'bone' ? '🦴' : '🫀');
    const typeLabel = ANATOMY_TYPE_LABEL[type] || type;

    // Build description — include organ system if this is a sub-part
    let description = mesh.userData.organDescription ||
      `${typeLabel} 구조물입니다. "자세히 알아보기"를 클릭하면 위키백과의 상세 해부학 정보를 확인할 수 있습니다.`;

    // If this mesh is part of a larger organ system, note it
    const organSystem = mesh.userData.organSystem;
    if (organSystem && organSystem !== displayName) {
      description = `소속: ${organSystem}\n\n${description}`;
    }

    const info = {
      name: `${typeEmoji} ${displayName}`,
      description: description,
      tags: [typeLabel, type === 'organ' ? (organSystem || '장기계') : 'Z-Anatomy', `<a href="${wikiLink}" target="_blank" style="color: var(--primary); text-decoration: none;">📖 자세히 알아보기</a>`]
    };

    HUD.updateAnatomyInfo(info);

    // Track interaction
    inspectedParts.add(rawName);
    Objectives.complete('inspect_part');
    if (inspectedParts.size >= 3) Objectives.complete('explore_3');
    if (inspectedParts.size >= 5) Objectives.complete('explore_5');

    Analytics.trackEvent('anatomy', 'inspect', { part: displayName, type });
  }

  function registerHUD() {
    HUD.onCallback('layerToggle', (layer, active) => {
      toggleLayer(layer, active);
      Analytics.trackEvent('anatomy', 'toggle_layer', { layer, active });
      Objectives.complete('toggle_layer');
      if (layer === 'skeleton' || layer === 'bones') Objectives.complete('view_skeleton');
    });

    HUD.onCallback('anatomyParam', (param, value) => {
      if (param === 'opacity') {
        const opacity = value / 100;
        // Only apply transparency to muscles — bones stay fully visible
        meshCollections.muscles.forEach(mesh => {
          mesh.material.opacity = opacity;
        });
        // If muscles are significantly transparent, show organs and add bone glow
        if (opacity < 0.5) {
          meshCollections.bones.forEach(mesh => {
            mesh.material.opacity = 1.0;
            mesh.material.emissive = new THREE.Color(0x1a8aff);
            mesh.material.emissiveIntensity = 0.15;
          });
          // Show organs
          if (meshCollections._organContainer) {
            meshCollections._organContainer.visible = true;
          }
        } else {
          meshCollections.bones.forEach(mesh => {
            mesh.material.emissive = new THREE.Color(0x000000);
            mesh.material.emissiveIntensity = 0;
          });
          // Hide organs
          if (meshCollections._organContainer) {
            meshCollections._organContainer.visible = false;
          }
        }
      }
    });

    HUD.onCallback('anatomyView', (view) => {
      const camera = SceneManager.getCamera();
      const controls = SceneManager.getControls();
      if (view === 'front') {
        camera.position.set(0, 1.0, 3.2);
      } else if (view === 'back') {
        camera.position.set(0, 1.0, -3.2);
      } else {
        camera.position.set(1.8, 1.3, 2.5);
      }
      controls.target.set(0, 0.85, 0);
      controls.update();
    });

    // X-Ray mode
    HUD.onCallback('xrayToggle', (active) => {
      xrayMode = active;
      toggleXRay(active);
      Objectives.complete('xray_mode');
    });

    // See Inside mode — makes muscles semi-transparent to reveal bones
    HUD.onCallback('seeInsideToggle', (active) => {
      toggleSeeInside(active);
      Objectives.complete('view_organs');
    });

    // Search
    HUD.onCallback('anatomySearch', (query) => {
      searchAnatomy(query);
    });
  }

  function toggleLayer(layer, visible) {
    if (layer === 'organs') {
      // Show/hide the entire organ container group
      if (meshCollections._organContainer) {
        meshCollections._organContainer.visible = visible;
      }
      layerVisibility[layer] = visible;
      return;
    }

    const layerMap = {
      'muscles': meshCollections.muscles,
      'bones': meshCollections.bones,
      'skeleton': meshCollections.bones
    };

    const meshes = layerMap[layer];
    if (meshes) {
      meshes.forEach(mesh => {
        mesh.visible = visible;
      });
    }

    layerVisibility[layer] = visible;
  }

  function toggleXRay(active) {
    meshCollections.all.forEach(mesh => {
      if (!mesh.material) return;
      if (active) {
        mesh.material.wireframe = true;
        mesh.material.opacity = 0.5;
        mesh.visible = true;
      } else {
        mesh.material.wireframe = false;
        mesh.material.opacity = 1.0;
      }
    });
    // Show/hide organ container in x-ray
    if (meshCollections._organContainer) {
      meshCollections._organContainer.visible = active;
    }
  }

  function toggleSeeInside(active) {
    if (active) {
      // Make muscles semi-transparent so bones & organs show through
      meshCollections.muscles.forEach(mesh => {
        mesh.material.opacity = 0.15;
      });
      // Keep bones visible but semi-transparent so organs show through
      meshCollections.bones.forEach(mesh => {
        mesh.material.opacity = 0.4;
        mesh.material.emissive = new THREE.Color(0x1a8aff);
        mesh.material.emissiveIntensity = 0.15;
      });
      // Show organ container
      if (meshCollections._organContainer) {
        meshCollections._organContainer.visible = true;
      }
      Notifications.info('내부 보기', '근육이 투명해졌습니다. 장기와 뼈를 클릭하여 검사해 보세요.');
    } else {
      // Restore muscles
      meshCollections.muscles.forEach(mesh => {
        mesh.material.opacity = 1.0;
      });
      // Restore bones
      meshCollections.bones.forEach(mesh => {
        mesh.material.opacity = 1.0;
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 0;
      });
      // Hide organ container
      if (meshCollections._organContainer) {
        meshCollections._organContainer.visible = false;
      }
    }
  }

  function searchAnatomy(query) {
    if (!query || String(query).length < 1) return;

    const q = String(query).trim().toLowerCase();
    let found = null;

    // 1) 식별자 직접 일치 (영문/한글)
    meshCollections.all.forEach(mesh => {
      const name = (mesh.userData.nameDetail || mesh.userData.name || mesh.name || '').toLowerCase();
      if ((name.includes(q) || q.includes(name)) && !found) {
        found = mesh;
      }
    });

    // 2) 한글 쿼리 → KO_TO_ANATOMY 역방향 매핑으로 영문 별칭들 시도
    if (!found) {
      const koLabels = Object.keys(KO_TO_ANATOMY)
        .filter(k => q.includes(k) || k.includes(q))
        .sort((a, b) => b.length - a.length); // 긴 라벨 우선 (구분력↑)
      for (const koLabel of koLabels) {
        for (const alias of KO_TO_ANATOMY[koLabel]) {
          const aliasLower = alias.toLowerCase();
          const hit = meshCollections.all.find(mesh => {
            const name = (mesh.userData.nameDetail || mesh.userData.name || mesh.name || '').toLowerCase();
            return name.includes(aliasLower);
          });
          if (hit) { found = hit; break; }
        }
        if (found) break;
      }
    }

    if (found) {
      focusOnMesh(found, getMeshCenter(found));
      Notifications.success('찾음', `"${formatAnatomyName(found.userData.name || found.name)}"`);
      Objectives.complete('search_structure');
    } else {
      const tryAliases = (q && KO_TO_ANATOMY[q]) || [];
      console.warn(`[edusim search] "${query}" 매칭 실패. 시도한 영문 별칭:`, tryAliases);
      const hint = tryAliases.length > 0
        ? `"${query}"와(과) 일치하는 구조물이 없습니다 (시도: ${tryAliases.join(', ')})`
        : `"${query}"와(과) 일치하는 구조물이 없습니다. 다른 키워드(예: femur, 대퇴골, biceps)로 시도해 보세요.`;
      Notifications.info('찾을 수 없음', hint);
    }
  }

  function onBodyClick(event) {
    if (!modelLoaded) return;
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, SceneManager.getCamera());

    const visibleMeshes = meshCollections.all.filter(m => m.visible);
    const hits = raycaster.intersectObjects(visibleMeshes, false);

    if (hits.length > 0) {
      // Find the first hit that is NOT a transparent/ghostly mesh.
      const solidHit = hits.find(h => {
        const mat = h.object.material;
        return mat && mat.opacity > 0.5;
      });
      const hit = solidHit || hits[0];
      const mesh = hit.object;
      focusOnMesh(mesh, hit.point);
    }
  }

  let hoveredMesh = null;

  function onBodyHover(event) {
    if (!modelLoaded) return;
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, SceneManager.getCamera());

    const visibleMeshes = meshCollections.all.filter(m => m.visible);
    const hits = raycaster.intersectObjects(visibleMeshes, false);

    // Cursor feedback
    canvas.style.cursor = hits.length > 0 ? 'pointer' : 'grab';

    // Don't mess with hover highlight while a click-highlight is active
    if (highlightedMesh) return;

    // Clear previous hover
    if (hoveredMesh) {
      if (hoveredMesh.material && hoveredMesh.material.emissive) {
        hoveredMesh.material.emissive = new THREE.Color(0x000000);
        hoveredMesh.material.emissiveIntensity = 0;
      }
      hoveredMesh = null;
    }

    // Apply subtle hover glow to the mesh under cursor
    if (hits.length > 0) {
      // Prefer solid mesh over transparent ones
      const solidHit = hits.find(h => {
        const mat = h.object.material;
        return mat && mat.opacity > 0.5;
      });
      const targetMesh = solidHit ? solidHit.object : hits[0].object;
      hoveredMesh = targetMesh;
      if (hoveredMesh.material && hoveredMesh.material.emissive) {
        hoveredMesh.material.emissive = new THREE.Color(0x3b82f6);
        hoveredMesh.material.emissiveIntensity = 0.25;
      }
    }
  }

  function update(sceneRef, camera) {
    // Update tooltip screen position each frame
    updateTooltipScreenPosition();
  }

  function reset() {
    // Show all meshes
    meshCollections.all.forEach(mesh => {
      mesh.visible = true;
      const origMat = originalMaterials.get(mesh);
      if (origMat) {
        mesh.material.wireframe = false;
        mesh.material.opacity = 1.0;
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 0;
      }
    });

    xrayMode = false;
    highlightedMesh = null;
    layerVisibility.muscles = true;
    layerVisibility.bones = true;

    const camera = SceneManager.getCamera();
    camera.position.set(0, 1.0, 3.2);
    const controls = SceneManager.getControls();
    controls.target.set(0, 0.85, 0);
    controls.update();
    Notifications.info('초기화', '인체 해부학 탐색기가 기본 보기로 초기화되었습니다.');
  }

  function cleanup() {
    const canvas = document.getElementById('sim-canvas');
    if (canvas) {
      canvas.removeEventListener('click', onBodyClick);
      canvas.removeEventListener('mousemove', onBodyHover);
    }

    // Remove floating labels
    floatingLabels.forEach(label => {
      if (label.element) label.element.remove();
      scene.remove(label);
    });
    floatingLabels.length = 0;

    // Remove click tooltip
    if (clickTooltipEl) {
      clickTooltipEl.remove();
      clickTooltipEl = null;
    }
    clickTooltipTarget = null;
    inspectedParts.clear();
    modelLoaded = false;
    highlightedMesh = null;
    meshCollections.muscles.length = 0;
    meshCollections.bones.length = 0;
    meshCollections.all.length = 0;
    originalMaterials.clear();

    // Remove loading overlay if still present
    const loadEl = document.getElementById('model-loading');
    if (loadEl) loadEl.remove();
  }

  return { init, update, reset, cleanup };
})();
