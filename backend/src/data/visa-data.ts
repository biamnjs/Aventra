export type VisaStatus = 'free' | 'voa' | 'evisa' | 'required' | 'restricted' | 'domestic';

export interface VisaEntry {
  status: VisaStatus;
  days?: number;
  cost?: string;
  notes?: string;
  link?: string;
}

// All ISO alpha-2 country codes → Portuguese names
export const COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afeganistão', AL: 'Albânia', DZ: 'Argélia', AD: 'Andorra', AO: 'Angola',
  AG: 'Antígua e Barbuda', AR: 'Argentina', AM: 'Arménia', AU: 'Austrália',
  AT: 'Áustria', AZ: 'Azerbaijão', BS: 'Bahamas', BH: 'Barém', BD: 'Bangladesh',
  BB: 'Barbados', BY: 'Bielorrússia', BE: 'Bélgica', BZ: 'Belize', BJ: 'Benim',
  BT: 'Butão', BO: 'Bolívia', BA: 'Bósnia e Herzegovina', BW: 'Botswana',
  BR: 'Brasil', BN: 'Brunei', BG: 'Bulgária', BF: 'Burquina Faso', BI: 'Burundi',
  CV: 'Cabo Verde', KH: 'Camboja', CM: 'Camarões', CA: 'Canadá', CF: 'República Centro-Africana',
  TD: 'Chade', CL: 'Chile', CN: 'China', CO: 'Colômbia', KM: 'Comores',
  CG: 'Congo', CD: 'RD Congo', CR: 'Costa Rica', CI: 'Costa do Marfim', HR: 'Croácia',
  CU: 'Cuba', CY: 'Chipre', CZ: 'República Checa', DK: 'Dinamarca', DJ: 'Jibuti',
  DM: 'Dominica', DO: 'República Dominicana', EC: 'Equador', EG: 'Egito',
  SV: 'El Salvador', GQ: 'Guiné Equatorial', ER: 'Eritreia', EE: 'Estónia',
  SZ: 'Essuatíni', ET: 'Etiópia', FJ: 'Fiji', FI: 'Finlândia', FR: 'França',
  GA: 'Gabão', GM: 'Gâmbia', GE: 'Geórgia', DE: 'Alemanha', GH: 'Gana',
  GR: 'Grécia', GD: 'Granada', GT: 'Guatemala', GN: 'Guiné', GW: 'Guiné-Bissau',
  GY: 'Guiana', HT: 'Haiti', HN: 'Honduras', HU: 'Hungria', IS: 'Islândia',
  IN: 'Índia', ID: 'Indonésia', IR: 'Irão', IQ: 'Iraque', IE: 'Irlanda',
  IL: 'Israel', IT: 'Itália', JM: 'Jamaica', JP: 'Japão', JO: 'Jordânia',
  KZ: 'Cazaquistão', KE: 'Quénia', KI: 'Quiribati', KP: 'Coreia do Norte',
  KR: 'Coreia do Sul', KW: 'Kuwait', KG: 'Quirguistão', LA: 'Laos',
  LV: 'Letónia', LB: 'Líbano', LS: 'Lesoto', LR: 'Libéria', LY: 'Líbia',
  LI: 'Liechtenstein', LT: 'Lituânia', LU: 'Luxemburgo', MG: 'Madagáscar',
  MW: 'Malawi', MY: 'Malásia', MV: 'Maldivas', ML: 'Mali', MT: 'Malta',
  MH: 'Ilhas Marshall', MR: 'Mauritânia', MU: 'Maurícias', MX: 'México',
  FM: 'Micronésia', MD: 'Moldávia', MC: 'Mónaco', MN: 'Mongólia', ME: 'Montenegro',
  MA: 'Marrocos', MZ: 'Moçambique', MM: 'Mianmar', NA: 'Namíbia', NR: 'Nauru',
  NP: 'Nepal', NL: 'Países Baixos', NZ: 'Nova Zelândia', NI: 'Nicarágua',
  NE: 'Níger', NG: 'Nigéria', MK: 'Macedónia do Norte', NO: 'Noruega',
  OM: 'Omã', PK: 'Paquistão', PW: 'Palau', PA: 'Panamá', PG: 'Papua Nova Guiné',
  PY: 'Paraguai', PE: 'Peru', PH: 'Filipinas', PL: 'Polónia', PT: 'Portugal',
  QA: 'Catar', RO: 'Roménia', RU: 'Rússia', RW: 'Ruanda',
  KN: 'São Cristóvão e Névis', LC: 'Santa Lúcia', VC: 'São Vicente e Granadinas',
  WS: 'Samoa', SM: 'São Marinho', ST: 'São Tomé e Príncipe', SA: 'Arábia Saudita',
  SN: 'Senegal', RS: 'Sérvia', SC: 'Seychelles', SL: 'Serra Leoa', SG: 'Singapura',
  SK: 'Eslováquia', SI: 'Eslovénia', SB: 'Ilhas Salomão', SO: 'Somália',
  ZA: 'África do Sul', SS: 'Sudão do Sul', ES: 'Espanha', LK: 'Sri Lanka',
  SD: 'Sudão', SR: 'Suriname', SE: 'Suécia', CH: 'Suíça', SY: 'Síria',
  TW: 'Taiwan', TJ: 'Tajiquistão', TZ: 'Tanzânia', TH: 'Tailândia', TL: 'Timor-Leste',
  TG: 'Togo', TO: 'Tonga', TT: 'Trindade e Tobago', TN: 'Tunísia', TR: 'Turquia',
  TM: 'Turquemenistão', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ucrânia', AE: 'Emirados Árabes Unidos',
  GB: 'Reino Unido', US: 'Estados Unidos', UY: 'Uruguai', UZ: 'Usbequistão',
  VU: 'Vanuatu', VE: 'Venezuela', VN: 'Vietname', YE: 'Iémen',
  ZM: 'Zâmbia', ZW: 'Zimbábue',
  PF: 'Polinésia Francesa', NC: 'Nova Caledónia', GI: 'Gibraltar', HK: 'Hong Kong',
  MO: 'Macau', XK: 'Kosovo',
};

// Passport tier groups for rule shorthand
const SCHENGEN = ['AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU','IE','IT','LT','LV','LU','MT','NL','PL','PT','RO','SE','SI','SK','IS','NO','CH','LI'];
const T1 = ['GB','US','CA','AU','NZ','JP','KR','SG']; // top-tier, often same policy
const T2 = ['BR','MX','AR','IL','UA','AE'];

const f = (days = 90, notes?: string, link?: string): VisaEntry => ({ status: 'free', days, notes, link });
const ev = (cost: string, days = 90, notes?: string, link?: string): VisaEntry => ({ status: 'evisa', cost, days, notes, link });
const voa = (cost: string, days = 30, notes?: string): VisaEntry => ({ status: 'voa', cost, days, notes });
const req = (notes?: string, link?: string): VisaEntry => ({ status: 'required', notes, link });
const restricted = (notes?: string): VisaEntry => ({ status: 'restricted', notes });

function schengen(p: string): VisaEntry {
  if (SCHENGEN.includes(p)) return f(90, 'Livre circulação EU/Schengen — sem limite de dias para cidadãos UE');
  if (p === 'GB') return f(90, 'Livre circulação — sem ETA do lado Schengen');
  if ([...T1.filter(x => x !== 'GB'), ...T2].includes(p)) return f(90);
  if (p === 'TR') return req('Visto Schengen obrigatório — consulado do país de destino');
  if (p === 'RU') return req('Visto Schengen obrigatório; restrições podem aplicar-se');
  if (p === 'ZA') return req('Visto Schengen obrigatório');
  return req('Visto Schengen obrigatório');
}

function uk(p: string): VisaEntry {
  const etaLink = 'https://apply-for-an-eta.homeoffice.gov.uk';
  const etaNote = 'UK ETA obrigatório (£10, 2 anos, múltiplas entradas)';
  if ([...SCHENGEN, ...T1, ...T2, 'TR', 'ZA'].includes(p)) return ev('£10', 180, etaNote, etaLink);
  return req('Visto de visitante UK', 'https://www.gov.uk/apply-uk-visa');
}

function usa(p: string): VisaEntry {
  const estaLink = 'https://esta.cbp.dhs.gov';
  const estaNote = 'ESTA obrigatório ($21, 2 anos)';
  const estaElgible = [...SCHENGEN, 'GB', 'AU', 'NZ', 'CA', 'JP', 'KR', 'SG', 'IL', 'BR'];
  if (estaElgible.includes(p)) return ev('$21', 90, estaNote, estaLink);
  if (['MX','AR','AE','UA','TR','ZA','RU','IN','CN','NG','SA'].includes(p)) return req('Visto B1/B2', 'https://travel.state.gov/content/travel/en/us-visas.html');
  return req('Visto B1/B2', 'https://travel.state.gov');
}

function japan(p: string): VisaEntry {
  const jFree = ['PT','ES','FR','DE','IT','NL','AT','BE','SE','DK','FI','NO','IS','CH','IE','PL','HU','CZ','GR','HR','EE','SK','SI','RO','MT','LT','LV','LU','BG','CY','GB','US','CA','AU','NZ','KR','SG','BR','MX','AR','IL','AE','TR'];
  if (jFree.includes(p)) return f(90, 'Sem visto necessário');
  if (['UA','ZA','RU'].includes(p)) return req('Visto obrigatório', 'https://www.mofa.go.jp/j_info/visit/visa/');
  return req('Visto obrigatório', 'https://www.mofa.go.jp/j_info/visit/visa/');
}

function australia(p: string): VisaEntry {
  const evisitorLink = 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601';
  const etaEligible = [...SCHENGEN, 'GB'];
  const evisitorEligible = ['US','CA','BR','MX','AR','IL','UA'];
  const etaEligibleExtra = ['JP','KR','SG','AE'];
  if (etaEligible.includes(p)) return ev('Grátis', 365, 'eVisitor grátis (subclasse 651)', evisitorLink);
  if (evisitorEligible.includes(p)) return ev('Grátis', 365, 'eVisitor grátis', evisitorLink);
  if (etaEligibleExtra.includes(p) || p === 'NZ') return ev('AUD $20', 365, 'ETA online', evisitorLink);
  if (['TR','IN','CN','RU','ZA','NG','SA'].includes(p)) return req('Visto obrigatório', 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing');
  return req('Visto obrigatório');
}

function uae(p: string): VisaEntry {
  const voaFree = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','TR','RU','ZA'];
  if (voaFree.includes(p)) return { status: 'voa', days: 30, cost: 'Grátis', notes: 'Visto na chegada, extensível a 30 dias extra' };
  if (p === 'SA') return f(30, 'GCC — entrada livre');
  if (['IN','CN'].includes(p)) return { status: 'voa', days: 14, cost: 'AED 100', notes: 'VOA mediante condições — verificar elegibilidade' };
  return req('Visto obrigatório', 'https://u.ae/en/information-and-services/visa-and-emirates-id');
}

function thailand(p: string): VisaEntry {
  const free60 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','TR','RU','ZA','IN','CN','SA'];
  if (free60.includes(p)) return f(60, 'Sem visto — estadia de turismo até 60 dias');
  if (p === 'NG') return voa('THB 2.000', 15, 'VOA disponível');
  return req('Visto obrigatório', 'https://www.thaievisa.go.th');
}

function bali(p: string): VisaEntry {
  const free30 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','TR','RU'];
  if (free30.includes(p)) return f(30, 'Entrada gratuita 30 dias; extensível');
  return voa('USD $35', 30, 'Visto na chegada (VoA)');
}

function maldives(p: string): VisaEntry {
  if (p === 'IL') return restricted('Entrada não permitida — sem relações diplomáticas');
  return { status: 'voa', days: 30, cost: 'Grátis', notes: 'Visto grátis na chegada para todos os turistas' };
}

function morocco(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (p === 'IN') return req('Visto obrigatório');
  if (p === 'CN') return { status: 'voa', days: 30, cost: 'Grátis', notes: 'VOA 30 dias' };
  return req('Visto obrigatório');
}

function turkey(p: string): VisaEntry {
  const evLink = 'https://www.evisa.gov.tr';
  if (['PT','AE','IL','AR','UA','RU','ZA','BR'].includes(p)) return f(90, 'Sem visto necessário');
  if ([...SCHENGEN.filter(x => x !== 'PT'), ...T1, 'MX','TR'].includes(p)) return ev('$38', 90, 'e-Visto online', evLink);
  if (p === 'SA') return ev('$38', 90, 'e-Visto', evLink);
  return req('Visto obrigatório', evLink);
}

function kenya(p: string): VisaEntry {
  const evLink = 'https://evisa.go.ke';
  const allEv = [...SCHENGEN, ...T1, ...T2, 'TR','RU','ZA','IN','CN','SA'];
  if (allEv.includes(p)) return ev('USD $51', 90, 'e-Visto obrigatório', evLink);
  if (p === 'NG') return ev('USD $51', 90, 'e-Visto', evLink);
  return req('Visto obrigatório', evLink);
}

function egypt(p: string): VisaEntry {
  const evLink = 'https://www.visa2egypt.gov.eg';
  const voaList = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','RU','ZA'];
  if (voaList.includes(p)) return { ...voa('USD $25', 30), notes: 'VOA ou e-Visto online', link: evLink };
  if (['TR','IN','CN','NG','SA'].includes(p)) return ev('USD $25', 30, 'e-Visto obrigatório', evLink);
  return req('Visto obrigatório', evLink);
}

function vietnam(p: string): VisaEntry {
  const evLink = 'https://evisa.xuatnhapcanh.gov.vn';
  const free45 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA'];
  if (free45.includes(p)) return f(45, 'Sem visto — 45 dias');
  if (['IN','CN','NG','SA'].includes(p)) return ev('USD $25', 90, 'e-Visto obrigatório', evLink);
  return ev('USD $25', 90, 'e-Visto', evLink);
}

function southKorea(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA','SA'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (['IN','CN'].includes(p)) return req('Visto obrigatório');
  if (p === 'NG') return req('Visto obrigatório', 'https://www.0404.go.kr');
  return req('Visto obrigatório', 'https://www.0404.go.kr');
}

function china(p: string): VisaEntry {
  const visaLink = 'https://www.visaforchina.cn';
  const free15 = ['PT','ES','FR','DE','IT','NL','AT','BE','SE','DK','FI','NO','IS','CH','IE','PL','HU','CZ','GR','HR','EE','SK','SI','RO','MT','LT','LV','LU','BG','CY','GB','AU','NZ','KR','AR','MX','UA'];
  if (free15.includes(p)) return f(15, 'Sem visto até 15 dias (política recente 2024)');
  if (p === 'SG') return f(30, 'Sem visto 30 dias');
  if (p === 'BR') return f(90, 'Sem visto 90 dias');
  if (p === 'RU') return f(30, 'Sem visto 30 dias');
  if (p === 'AE') return f(30, 'Sem visto 30 dias');
  if (['US','CA','JP','IL','TR','ZA','IN','NG','SA'].includes(p)) return req('Visto obrigatório', visaLink);
  return req('Visto obrigatório', visaLink);
}

function india(p: string): VisaEntry {
  const evLink = 'https://indianvisaonline.gov.in';
  const evisaEligible = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','CN','NG','SA'];
  if (evisaEligible.includes(p)) return ev('USD $25–80', 60, 'e-Visto obrigatório (múltiplas categorias)', evLink);
  return req('Visto obrigatório', evLink);
}

function nepal(p: string): VisaEntry {
  if (p === 'IN') return f(90, 'Livre circulação Índia–Nepal (sem visto)');
  const voaEligible = [...SCHENGEN, ...T1, ...T2, 'TR','RU','ZA','CN','NG','SA'];
  if (voaEligible.includes(p)) return { ...voa('USD $30–50', 15), notes: '15/30/90 dias; e-Visto também disponível', link: 'https://nepaliport.immigration.gov.np' };
  return req('Visto obrigatório');
}

function sriLanka(p: string): VisaEntry {
  const etaLink = 'https://eta.gov.lk';
  const etaFree = ['IN'];
  if (etaFree.includes(p)) return ev('Grátis', 30, 'ETA gratuito para cidadãos indianos', etaLink);
  return ev('USD $35', 30, 'ETA online obrigatório', etaLink);
}

function cambodia(p: string): VisaEntry {
  const evLink = 'https://www.evisa.gov.kh';
  return ev('USD $36', 30, 'e-Visto online ou VOA disponível', evLink);
}

function malaysia(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','CN'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (p === 'IN') return ev('Grátis', 30, 'eNTL online gratuito');
  if (p === 'NG') return req('Visto obrigatório');
  if (p === 'SA') return f(30, 'Sem visto 30 dias');
  return req('Visto obrigatório');
}

function philippines(p: string): VisaEntry {
  const free30 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','IN','NG','SA','CN'];
  if (free30.includes(p)) return f(30, 'Sem visto — entrada gratuita 30 dias');
  return req('Visto obrigatório');
}

function singapore(p: string): VisaEntry {
  const free30 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','IN','NG','SA','CN'];
  if (free30.includes(p)) return f(30, 'Sem visto necessário');
  return req('Visto obrigatório');
}

function argentina(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','CN','IN'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  return req('Visto obrigatório');
}

function brazil(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'AR','MX','IL','AE','UA','TR','RU','ZA','CN'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (p === 'IN') return req('Visto obrigatório');
  if (p === 'NG') return req('Visto obrigatório');
  if (p === 'SA') return req('Visto obrigatório');
  return req('Visto obrigatório');
}

function mexico(p: string): VisaEntry {
  const free180 = [...SCHENGEN, ...T1, 'BR','AR','IL','AE','UA','TR','RU','ZA'];
  if (free180.includes(p)) return f(180, 'Sem visto necessário');
  if (['IN','CN','NG','SA'].includes(p)) return req('Visto obrigatório');
  return req('Visto obrigatório');
}

function peru(p: string): VisaEntry {
  const free183 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA'];
  if (free183.includes(p)) return f(183, 'Sem visto necessário');
  if (['IN','CN','NG','SA'].includes(p)) return req('Visto obrigatório');
  return req('Visto obrigatório');
}

function colombia(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  return req('Visto obrigatório');
}

function chile(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA','IN','CN','SA','NG'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  return req('Visto obrigatório');
}

function cuba(p: string): VisaEntry {
  const cardRequired = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA'];
  if (cardRequired.includes(p)) return ev('USD $25', 30, 'Tarjeta del turista — compra obrigatória (aeroporto ou consulado)');
  if (['CN','IN','NG','SA'].includes(p)) return req('Visto obrigatório');
  return req('Visto obrigatório');
}

function costaRica(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (['IN','CN','NG','SA'].includes(p)) return req('Visto obrigatório');
  return req('Visto obrigatório');
}

function ecuador(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA','IN','CN','SA'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (p === 'NG') return req('Visto obrigatório');
  return req('Visto obrigatório');
}

function bolivia(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','TR'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (['AE','RU','ZA','IN','CN','NG','SA'].includes(p)) return voa('USD $30', 90, 'VOA disponível');
  return req('Visto obrigatório');
}

function southAfrica(p: string): VisaEntry {
  const free30 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR'];
  if (free30.includes(p)) return f(30, 'Sem visto necessário');
  if (['RU','CN','IN','NG','SA'].includes(p)) return req('Visto obrigatório', 'https://www.vfsglobal.com/dha/southafrica');
  return req('Visto obrigatório');
}

function tanzania(p: string): VisaEntry {
  const evLink = 'https://visa.immigration.go.tz';
  const evisa = [...SCHENGEN, ...T1, ...T2, 'TR','RU','ZA','IN','CN','NG','SA'];
  if (evisa.includes(p)) return ev('USD $50', 90, 'e-Visto ou VOA disponíveis', evLink);
  return req('Visto obrigatório', evLink);
}

function mauritius(p: string): VisaEntry {
  const free60 = [...SCHENGEN, ...T1, ...T2, 'TR','RU','ZA','IN','CN','NG','SA'];
  if (free60.includes(p)) return f(60, 'Sem visto necessário');
  return req('Visto obrigatório');
}

function seychelles(p: string): VisaEntry {
  return { status: 'voa', days: 30, cost: 'Grátis', notes: 'Todos os visitantes recebem autorização de viagem gratuita na chegada' };
}

function tunisia(p: string): VisaEntry {
  const free90 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','AE','UA','TR','RU','ZA'];
  if (free90.includes(p)) return f(90, 'Sem visto necessário');
  if (['IN','CN','NG','SA'].includes(p)) return req('Visto obrigatório');
  return req('Visto obrigatório');
}

function rwanda(p: string): VisaEntry {
  const evLink = 'https://irembo.gov.rw/rolportal/entry-visa/new-application';
  return ev('USD $50', 30, 'e-Visto para todos os estrangeiros', evLink);
}

function ghana(p: string): VisaEntry {
  const evLink = 'https://www.ghanaimmigration.org';
  if (['US','CA','GB','AU','NZ','DE','FR','IT','ES','PT','NL'].includes(p)) return ev('USD $60', 60, 'Visto necessário (pode ser e-Visto)', evLink);
  return req('Visto obrigatório', evLink);
}

function israel(p: string): VisaEntry {
  if (['MA','TN','LY','DZ','IQ','IR','SY','YE','LB','SA','KW','QA','BH','OM','PK','ID'].includes(p)) return restricted('Entrada restringida / relações diplomáticas inexistentes');
  if (['RU','UA','TR','IN','ZA','CN','NG'].includes(p)) return req('Visto obrigatório', 'https://www.gov.il/en/service/entering-israel');
  return f(90, 'Sem visto necessário');
}

function jordan(p: string): VisaEntry {
  const voaLink = 'https://www.timatic.iata.org';
  const voaAll = [...SCHENGEN, ...T1, ...T2, 'TR','RU','ZA','IN','CN','NG','SA'];
  if (voaAll.includes(p)) return { ...voa('JOD 40', 30), notes: 'VOA ou e-Visto Jordan Pass (inclui entradas)', link: 'https://www.jordanpass.jo' };
  return req('Visto obrigatório', voaLink);
}

function oman(p: string): VisaEntry {
  const evLink = 'https://evisa.rop.gov.om';
  const evAll = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','IN','CN','NG','SA'];
  if (evAll.includes(p)) return ev('OMR 20', 30, 'e-Visto obrigatório', evLink);
  return req('Visto obrigatório', evLink);
}

function qatar(p: string): VisaEntry {
  const free30 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','IN','CN','NG','SA'];
  if (free30.includes(p)) return { status: 'voa', days: 30, cost: 'Grátis', notes: 'Visa on arrival gratuita' };
  return req('Visto obrigatório');
}

function saudiArabia(p: string): VisaEntry {
  const evLink = 'https://visa.visitsaudi.com';
  const evisaEligible = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','IN','CN'];
  if (evisaEligible.includes(p)) return ev('USD $134', 90, 'e-Visto turístico, múltiplas entradas por 1 ano', evLink);
  if (p === 'NG') return req('Visto obrigatório', evLink);
  return req('Visto obrigatório', evLink);
}

function fiji(p: string): VisaEntry {
  const free120 = [...SCHENGEN, ...T1, 'BR','MX','AR','IL','UA','AE','TR','RU','ZA','IN','CN','NG','SA'];
  if (free120.includes(p)) return f(120, 'Sem visto — até 4 meses');
  return req('Visto obrigatório');
}

function frenchPolynesia(p: string): VisaEntry {
  if (SCHENGEN.includes(p)) return f(90, 'Território francês — circulação livre UE');
  if ([...T1, 'BR','MX','AR','IL','UA','AE'].includes(p)) return f(90, 'Sem visto necessário');
  if (['TR','RU','ZA','IN','CN','NG','SA'].includes(p)) return req('Visto obrigatório');
  return req('Visto obrigatório');
}

// Map destination country codes to their rule function
const RULES: Record<string, (p: string) => VisaEntry> = {
  // Schengen area destinations
  FR: schengen, DE: schengen, IT: schengen, ES: schengen, PT: schengen,
  NL: schengen, AT: schengen, BE: schengen, SE: schengen, DK: schengen,
  FI: schengen, NO: schengen, IS: schengen, CH: schengen, IE: schengen,
  PL: schengen, HU: schengen, CZ: schengen, GR: schengen, HR: schengen,
  EE: schengen, SK: schengen, SI: schengen, RO: schengen, MT: schengen,
  LT: schengen, LV: schengen, LU: schengen, BG: schengen, CY: schengen,
  // Other key destinations
  GB: uk, US: usa, JP: japan, AU: australia, AE: uae, TH: thailand,
  ID: bali, MV: maldives, MA: morocco, TR: turkey, KE: kenya, EG: egypt,
  VN: vietnam, KR: southKorea, CN: china, IN: india, NP: nepal, LK: sriLanka,
  KH: cambodia, MY: malaysia, PH: philippines, SG: singapore,
  AR: argentina, BR: brazil, MX: mexico, PE: peru, CO: colombia, CL: chile,
  CU: cuba, CR: costaRica, EC: ecuador, BO: bolivia,
  ZA: southAfrica, TZ: tanzania, MU: mauritius, SC: seychelles,
  TN: tunisia, RW: rwanda, GH: ghana,
  IL: israel, JO: jordan, OM: oman, QA: qatar, SA: saudiArabia,
  FJ: fiji, PF: frenchPolynesia, NZ: (p) => australia(p),
  CA: (p) => usa(p),
};

export function getVisaInfo(destinationCode: string, passportCode: string): VisaEntry {
  if (!destinationCode || !passportCode) {
    return { status: 'required', notes: 'Consulte fontes oficiais' };
  }

  const dest = destinationCode.toUpperCase();
  const pass = passportCode.toUpperCase();

  if (dest === pass) return { status: 'domestic', notes: 'País de cidadania — sem requisitos de entrada' };

  const rule = RULES[dest];
  if (rule) return rule(pass);

  return {
    status: 'required',
    notes: 'Consulte sempre fontes oficiais antes de viajar',
    link: `https://www.passportindex.org/comparebyPassport.php?p1=${pass.toLowerCase()}`,
  };
}
