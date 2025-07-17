import { Card, CardType, RibbonColor, OpponentProfile } from './types';

export const BASE_STARTING_CAPITAL = 50000;
export const CAPITAL_INCREMENT_PER_ROUND = 25000;
export const DEFAULT_POINTS_TO_CAPITAL_RATE = 100;

export const TOURNAMENT_OPPONENTS: OpponentProfile[] = [
    { id: 1, name: "첫 상대, 김철수", title: "동네 순둥이", description: "화투는 처음이지만, 운이 좋다고 소문이 자자합니다. 방심은 금물!" },
    { id: 2, name: "고양이 집사", title: "수수께끼의 그녀", description: "항상 고양이와 함께 나타납니다. 그녀의 포커페이스는 고양이를 닮았습니다." },
    { id: 3, name: "복학생 오빠", title: "이론은 완벽", description: "화투 이론을 줄줄 꿰고 있지만, 실전은 어떨까요? 그의 이론을 깨부숴주세요." },
    { id: 4, name: "시장의 상인", title: "계산의 달인", description: "언제나 주판을 튕기며 모든 것을 돈으로 계산합니다. 그의 자본금을 노려보세요." },
    { id: 5, name: "8강 첫 관문, 박여사", title: "동네 정보통", description: "모르는 게 없는 동네 마당발. 그녀의 정보망이 게임에 어떤 영향을 미칠까요?" },
    { id: 6, name: "낭만파 시인", title: "풍류를 즐기는 자", description: "패 하나하나에 시적인 의미를 부여합니다. 그의 감성에 휘말리지 마세요." },
    { id: 7, name: "젊은 프로그래머", title: "확률의 지배자", description: "모든 경우의 수를 계산하는 AI같은 플레이어. 허점을 찾아 공략해야 합니다." },
    { id: 8, name: "은퇴한 형사", title: "심리전의 대가", description: "상대의 작은 표정 변화도 놓치지 않습니다. 그의 날카로운 눈을 피할 수 있을까요?" },
    { id: 9, name: "4강 상대, 미스터 리", title: "해외에서 온 도전자", description: "라스베이거스에서 포커로 명성을 떨치다 화투에 도전했습니다. 그의 플레이는 예측불허!" },
    { id: 10, name: "아이돌 연습생", title: "승부욕의 화신", description: "데뷔보다 이기는 게 더 중요하다고 외치는 열정의 소유자. 기세에 눌리면 안 됩니다." },
    { id: 11, name: "무뚝뚝한 셰프", title: "최고의 재료, 최고의 패", description: "최고의 요리를 만들 듯, 최고의 패 조합을 만들어냅니다. 그의 레시피를 망쳐보세요." },
    { id: 12, name: "의문의 가면인", title: "정체불명의 타짜", description: "아무도 그의 정체를 모릅니다. 가면 뒤에 숨겨진 실력은 과연 어느 정도일까요?" },
    { id: 13, name: "결승전, 이회장", title: "재계의 거물", description: "돈으로는 져본 적이 없습니다. 그의 막대한 자본 앞에서 실력으로 증명해야 합니다." },
    { id: 14, name: "숨겨진 고수", title: "산속의 은둔자", description: "속세를 떠나 화투 도를 수련한 전설적인 인물. 자연의 기운으로 패를 읽습니다." },
    { id: 15, name: "최종 보스, 그림자", title: "화투의 신", description: "화투판의 모든 것을 주관한다는 소문 속 존재. 그를 이기면, 당신이 새로운 전설이 됩니다." },
];

export const CARDS: Card[] = [
  // Month 1 (January - Pine)
  { id: 1, month: 1, type: CardType.GWANG, image: 'https://i.imghippo.com/files/WGKL1665jnY.png' },
  { id: 2, month: 1, type: CardType.TTI, ribbonColor: RibbonColor.RED, image: 'https://i.imghippo.com/files/hiYQ4022rlk.png' },
  { id: 3, month: 1, type: CardType.PI, image: 'https://i.imghippo.com/files/LDH4093ZYY.png' },
  { id: 4, month: 1, type: CardType.PI, image: 'https://i.imghippo.com/files/SLj8383DRw.png' },

  // Month 2 (February - Plum Blossom)
  { id: 5, month: 2, type: CardType.YUL, isGodori: true, image: 'https://i.imghippo.com/files/zXj8834O.png' },
  { id: 6, month: 2, type: CardType.TTI, ribbonColor: RibbonColor.RED, image: 'https://i.imghippo.com/files/nzn9739QU.png' },
  { id: 7, month: 2, type: CardType.PI, image: 'https://i.imghippo.com/files/xh1683aOo.png' },
  { id: 8, month: 2, type: CardType.PI, image: 'https://i.imghippo.com/files/aEuY9824ZU.png' },

  // Month 3 (March - Cherry Blossom)
  { id: 9, month: 3, type: CardType.GWANG, image: 'https://i.imghippo.com/files/Pj2677Yo.png' },
  { id: 10, month: 3, type: CardType.TTI, ribbonColor: RibbonColor.RED, image: 'https://i.imghippo.com/files/gOKJ1297Auw.png' },
  { id: 11, month: 3, type: CardType.PI, image: 'https://i.imghippo.com/files/Edx3401Eb.png' },
  { id: 12, month: 3, type: CardType.PI, image: 'https://i.imghippo.com/files/achc5500cs.png' },

  // Month 4 (April - Wisteria)
  { id: 13, month: 4, type: CardType.YUL, isGodori: true, image: 'https://i.imghippo.com/files/sps5725bII.png' },
  { id: 14, month: 4, type: CardType.TTI, ribbonColor: RibbonColor.GRASS, image: 'https://i.imghippo.com/files/BBe9670pE.png' },
  { id: 15, month: 4, type: CardType.PI, image: 'https://i.imghippo.com/files/En6063Ug.png' },
  { id: 16, month: 4, type: CardType.PI, image: 'https://i.imghippo.com/files/nOFh1194tuE.png' },

  // Month 5 (May - Iris)
  { id: 17, month: 5, type: CardType.YUL, image: 'https://i.imghippo.com/files/NZD9178Pcw.png' },
  { id: 18, month: 5, type: CardType.TTI, ribbonColor: RibbonColor.GRASS, image: 'https://i.imghippo.com/files/uFg5708dX.png' },
  { id: 19, month: 5, type: CardType.PI, image: 'https://i.imghippo.com/files/zqgp4819Sn.png' },
  { id: 20, month: 5, type: CardType.PI, image: 'https://i.imghippo.com/files/cPPc7219tY.png' },

  // Month 6 (June - Peony)
  { id: 21, month: 6, type: CardType.YUL, image: 'https://i.imghippo.com/files/aTyb4252Ro.png' },
  { id: 22, month: 6, type: CardType.TTI, ribbonColor: RibbonColor.BLUE, image: 'https://i.imghippo.com/files/UE9443jIM.png' },
  { id: 23, month: 6, type: CardType.PI, image: 'https://i.imghippo.com/files/wOkz3303vFs.png' },
  { id: 24, month: 6, type: CardType.PI, image: 'https://i.imghippo.com/files/qkxP6474aT.png' },

  // Month 7 (July - Bush Clover)
  { id: 25, month: 7, type: CardType.YUL, image: 'https://i.imghippo.com/files/vDX2311eBI.png' },
  { id: 26, month: 7, type: CardType.TTI, ribbonColor: RibbonColor.GRASS, image: 'https://i.imghippo.com/files/gYgy4070Znk.png' },
  { id: 27, month: 7, type: CardType.PI, image: 'https://i.imghippo.com/files/zAPd6085sLs.png' },
  { id: 28, month: 7, type: CardType.PI, image: 'https://i.imghippo.com/files/ptV1684xFM.png' },

  // Month 8 (August - Pampas Grass)
  { id: 29, month: 8, type: CardType.GWANG, image: 'https://i.imghippo.com/files/CDwS2864so.png' },
  { id: 30, month: 8, type: CardType.YUL, isGodori: true, image: 'https://i.imghippo.com/files/UH3563JHg.png' },
  { id: 31, month: 8, type: CardType.PI, image: 'https://i.imghippo.com/files/lQaM3917dm.png' },
  { id: 32, month: 8, type: CardType.PI, image: 'https://i.imghippo.com/files/OON1021fac.png' },

  // Month 9 (September - Chrysanthemum)
  { id: 33, month: 9, type: CardType.YUL, isGukjin: true, isDoublePi: true, image: 'https://i.imghippo.com/files/GHcI8622UOQ.png' },
  { id: 34, month: 9, type: CardType.TTI, ribbonColor: RibbonColor.BLUE, image: 'https://i.imghippo.com/files/OHg6761Ypc.png' },
  { id: 35, month: 9, type: CardType.PI, image: 'https://i.imghippo.com/files/BAi7285EI.png' },
  { id: 36, month: 9, type: CardType.PI, image: 'https://i.imghippo.com/files/amH4918vr.png' },

  // Month 10 (October - Maple)
  { id: 37, month: 10, type: CardType.YUL, image: 'https://i.imghippo.com/files/rt1374aNQ.png' },
  { id: 38, month: 10, type: CardType.TTI, ribbonColor: RibbonColor.BLUE, image: 'https://i.imghippo.com/files/lEI6705ogY.png' },
  { id: 39, month: 10, type: CardType.PI, image: 'https://i.imghippo.com/files/eXiH5990Jo.png' },
  { id: 40, month: 10, type: CardType.PI, image: 'https://i.imghippo.com/files/bzb1677wI.png' },

  // Month 11 (November - Paulownia)
  { id: 41, month: 11, type: CardType.GWANG, image: 'https://i.imghippo.com/files/lmzi3274bU.png' }, // Not a double pi
  { id: 42, month: 11, type: CardType.PI, image: 'https://i.imghippo.com/files/wFu1332Cxo.png' },
  { id: 43, month: 11, type: CardType.PI, image: 'https://i.imghippo.com/files/XaDO1907UDk.png' },
  { id: 44, month: 11, type: CardType.PI, isDoublePi: true, image: 'https://i.imghippo.com/files/jvDp2736cLA.png' },

  // Month 12 (December - Rain)
  { id: 45, month: 12, type: CardType.GWANG, image: 'https://i.imghippo.com/files/LfL4065aQY.png' }, // Bi Gwang (Rain Bright)
  { id: 46, month: 12, type: CardType.YUL, image: 'https://i.imghippo.com/files/Hpg5050q.png' },
  { id: 47, month: 12, type: CardType.TTI, image: 'https://i.imghippo.com/files/KqQU1804oVc.png' }, // Bi Tti
  { id: 48, month: 12, type: CardType.PI, isDoublePi: true, image: 'https://i.imghippo.com/files/bj1730S.png' },
];