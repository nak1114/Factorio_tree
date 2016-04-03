#!ruby -Ku
# -*- encoding: utf-8 -*-

TypeList={
	"採掘用具"=> :crafting,
	"溶鉱炉"=> :crafting,
	"組立機"=> :crafting,
	"流体"=> :crafting,
	'資源'=> :resource,
	'中間生産物'=> :crafting,
}
AsmList={
	:resource => ["hand_mining"],
	:crafting => ["assembling_machine_1","assembling_machine_2","assembling_machine_3"]
}
FactryList={
"burner_mining_drill"  =>	%!    "production_efficiency" : 1.0 !,
"electric_mining_drill"=>	%!    "production_efficiency" : 0.5 !,
"assembling_machine_1" =>	%!    "production_efficiency" : 0.5 !,
"assembling_machine_2" =>	%!    "production_efficiency" : 0.75 !,
"assembling_machine_3" =>	%!    "production_efficiency" : 1.25 !,
"stone_furnace"        =>	%!    "production_efficiency" : 0.5 !,
"steel_furnace"        =>	%!    "production_efficiency" : 1.0 !,
"electric_furnace"     =>	%!    "production_efficiency" : 1.0 !,
"chemical_plant"       =>	%!    "production_efficiency" : 1.0 !,
}

TransID={
	"basic_mining_drill" => "electric_mining_drill"
}

category_global=nil
count_items=0


header = <<EOS
{
  "hand_mining" : {
    "icon" : "hand-mining.png",
    "name" : "手堀",
    "production_efficiency" : 1.0
  },
EOS

header_en = <<EOS
{
  "hand_mining" : {
    "icon" : "hand-mining.png",
    "name" : "hand mining",
    "production_efficiency" : 1.0
  },
EOS
	is_en=(ARGV[0]=='en')

header = header_en if is_en

	puts header
DATA.read.each_line do |v|
	if v.chomp.match(/^(.+)\s\sEdit$/)
		category_global=TypeList[Regexp.last_match(1)]||category_global
		next
	end
	s= v.chomp.split("\t")
	next unless s.size == 7
	next unless s[0].match(/\.png$/)

	category=category_global
	id     =s[0][/^[^.]*/].gsub('-','_')
	icon   =s[0]
	name   =s[1][/^[^\(]*/] #)
	query  =s[1]
	count  =s[3].to_f
	time   =s[6].to_f
	recipe =s[2].gsub('-','_').scan(/(\w+)\.png(?:\*(\d+))?/).map{|v| [v[0],(v[1]||1).to_i]}
	factory=s[4].gsub('-','_').scan(/(\w+)\.png/).map{|v| v[0]}

	if is_en
		name   =s[1][/\((.*)\)/,1] 
		query  =name
	end

	count=1.0 if count==0
	time =1.0 if time==0
	if factory.size==0 then
		factory=AsmList[category]
		if category== :crafting then
			factory-=[:assembling_machine_1] if recipe.size > 2
		end
	end
	
	if factory.include?("stone_furnace") then
		category=:smelting
	elsif factory.include?("chemical_plant") then
		category=:chemistry
	end
	id = TransID[id] || id
  puts %!  \},! if count_items!=0
	puts %!  "#{id}": \{!
	puts %!    "icon": "icons/#{icon}" ,!
	puts %!    "name": "#{name}",!
	puts %!    "query": "#{query}",!
	puts %!    "quantity": #{count},!
	puts %!    "time": #{time},!
	puts %!    "category": "#{category}",!
	puts %!    "ingredients": #{recipe},!
	if FactryList[id] then
		puts %!    "factory": #{factory},!
		puts FactryList[id]
	else
		puts %!    "factory": #{factory}!
	end
	count_items=count_items+1
end
  puts %!  \}!
	puts %!\}!


__END__

資源  Edit

raw-wood.png	原木(Raw wood)		10			0.5
coal.png	石炭(Coal)		0.5715	burner-mining-drill.pngelectric-mining-drill.png		1
iron-ore.png	鉄鉱石(Iron ore)		0.5715	burner-mining-drill.pngelectric-mining-drill.png		1
copper-ore.png	銅鉱石(Copper ore)		0.5715	burner-mining-drill.pngelectric-mining-drill.png		1
stone.png	石(Stone)		0.5715	burner-mining-drill.pngelectric-mining-drill.png		1
crude-oil.png	原油(Crude oil)		10	pumpjack.png		0.5
fish.png	生魚(Raw fish)		10			0.5
alien-artifact.png	エイリアンアーティファクト(Alien artifact)		10			0.5
water.png	水(Water)		10	offshore-pump.png		0.5

中間生産物  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
wood.png	木材(Wood)	raw-wood.png*1	2			0.5
iron-plate.png	鉄板(Iron plate)	iron-ore.png*1	1	stone-furnace.pngsteel-furnace.pngelectric-furnace.png		3.5
copper-plate.png	銅板(Copper plate)	copper-ore.png*1	1	stone-furnace.pngsteel-furnace.pngelectric-furnace.png		3.5
steel-plate.png	鋼材(Steel plate)	iron-plate.png*5	1	stone-furnace.pngsteel-furnace.pngelectric-furnace.png		17.5
stone-brick.png	石レンガ(Stone brick)	stone.png*2	1	stone-furnace.pngsteel-furnace.pngelectric-furnace.png	レシピは物流カテゴリにある地面に設置・回収可石レンガの上では移動速度+30%	3.5
concrete.png	コンクリート(Concrete)	stone-brick.png*5, iron-ore.png*1, water.png*10	10	assembling-machine-2.pngassembling-machine-3.png	レシピは物流カテゴリにある地面に設置・回収可コンクリート上では移動速度+40%	10
sulfur.png	硫黄(Sulfur)	water.png*3, petroleum-gas.png*3	2	chemical-plant.png		1
plastic-bar.png	プラスチック棒(Plastic bar)	petroleum-gas.png*3, coal.png*1	2	chemical-plant.png		1
empty-barrel.png	空のドラム缶(Empty barrel)	steel-plate.png*1	1			1
iron-stick.png	鉄筋(Iron stick)	iron-plate.png*1	2			0.5
iron-gear-wheel.png	鉄の歯車(Iron gear wheel)	iron-plate.png*2	1			0.5
copper-cable.png	銅線(Copper cable)	copper-plate.png*1	2		レシピは物流カテゴリにある	0.5
electronic-circuit.png	電子基板(Electronic circuit)	iron-plate.png*1, copper-cable.png*3	1			0.5
advanced-circuit.png	発展基板(Advanced circuit)	electronic-circuit.png*2, plastic-bar.png*2, copper-cable.png*4	1			8
processing-unit.png	制御基板(Processing unit)	electronic-circuit.png*20, advanced-circuit.png*2, sulfuric-acid.png*0.5	1	assembling-machine-2.pngassembling-machine-3.png		15
engine-unit.png	エンジンユニット(Engine unit)	steel-plate.png*1, iron-gear-wheel.png*1, pipe.png*2	1	assembling-machine-2.pngassembling-machine-3.png		20
electric-engine-unit.png	電気エンジンユニット(Electric engine unit)	engine-unit.png*1, lubricant.png*2, electronic-circuit.png*2	1	assembling-machine-2.pngassembling-machine-3.png		20
explosives.png	火薬(Explosives)	sulfur.png*1, coal.png*1, water.png*1	1	chemical-plant.png		5
battery.png	電池(Battery)	sulfuric-acid.png*2, iron-plate.png*1, copper-plate.png*1	1	chemical-plant.png		5
flying-robot-frame.png	飛行用ロボットフレーム(Flying robot frame)	electric-engine-unit.png*1, battery.png*2, steel-plate.png*1, electronic-circuit.png*3	1			20
science-pack-1.png	サイエンスパック1(Science Pack 1)	copper-plate.png*1, iron-gear-wheel.png*1	1			5
science-pack-2.png	サイエンスパック2(Science Pack 2)	basic-inserter.png*1, basic-transport-belt.png*1	1			6
science-pack-3.png	サイエンスパック3(Science Pack 3)	battery.png*1, advanced-circuit.png*1, smart-inserter.png*1, steel-plate.png*1	1			12
alien-science-pack.png	エイリアンサイエンスパック(Alien science pack)	alien-artifact.png*1	10			12
solid-fuel.png	固形燃料(Solid fuel)	heavy-oil.png*2	1	chemical-plant.png		3
rocket-structure.png	断熱材(Low density structure)	steel-plate.png*10, copper-plate.png*5, plastic-bar.png*5	1			30
rocket-fuel.png	ロケット燃料(Rocket fuel)	solid-fuel.png*10	1			30
rocket-control-unit.png	ロケット制御ユニット(Rocket control unit)	processing-unit.png*1, speed-module.png*1	1			30
satellite.png	衛星(Satellite)	rocket-structure.png*100, solar-panel.png*100, basic-accumulator.png*100, radar.png*5, processing-unit.png*100, rocket-fuel.png*50	1			3

流体  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
sulfuric-acid.png	硫酸(Sulfuric acid)	sulfur.png*5, iron-plate.png*1, water.png*10	5	chemical-plant.png	流体	1
heavy-oil.png	重油(Heavy oil)	crude-oil.png*10	3	oil-refinery.png	流体	5
light-oil.png	軽油(Light oil)	crude-oil.png*10	3	oil-refinery.png	流体	5
petroleum-gas.png	プロパンガス(Petroleum gas)	crude-oil.png*10	4	oil-refinery.png	流体	5
lubricant.png	潤滑油(Lubricant)	heavy-oil.png*1	1	chemical-plant.png	流体	1



運送・物流関係物  Edit

▲ ▼
貯蔵  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
wooden-chest.png	木製チェスト(Wooden chest)	wood.png*4	1		容量16	0.5
iron-chest.png	鉄製チェスト(Iron chest)	iron-plate.png*8	1		容量32	0.5
steel-chest.png	鋼鉄製チェスト(Steel chest)	steel-plate.png*8	1		容量48	0.5
smart-chest.png	スマートチェスト(Smart chest)	steel-chest.png*1, electronic-circuit.png*3	1		容量48	0.5
logistic-chest-active-provider.png	アクティブ供給チェスト(Active provider chest)	smart-chest.png*1, advanced-circuit.png*1	1		容量48物流チェスト	0.5
logistic-chest-passive-provider.png	パッシブ供給チェスト(Passive provider chest)	smart-chest.png*1, advanced-circuit.png*1	1		容量48物流チェスト	0.5
logistic-chest-requester.png	要求チェスト(Requester chest)	smart-chest.png*1, advanced-circuit.png*1	1		容量48物流チェスト	0.5
logistic-chest-storage.png	貯蔵チェスト(Storage chest)	smart-chest.png*1, advanced-circuit.png*1	1		容量48物流チェスト	0.5
storage-tank.png	貯蔵タンク(Storage tank)	iron-plate.png*20, steel-plate.png*5	1		流体容量2500	3
▲ ▼
運送  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
basic-transport-belt.png	搬送ベルト(Transport belt)	iron-plate.png*1, iron-gear-wheel.png*1	2			0.5
fast-transport-belt.png	高速搬送ベルト(Fast transport belt)	iron-gear-wheel.png*5, basic-transport-belt.png*1	1			0.5
express-transport-belt.png	超高速搬送ベルト(Express transport belt)	iron-gear-wheel.png*5, fast-transport-belt.png*1, lubricant.png*2	1	assembling-machine-2.pngassembling-machine-3.png		0.5
basic-transport-belt-to-ground.png	地下ベルトコンベア(Underground belt)	iron-plate.png*10, basic-transport-belt.png*5	2			1
fast-transport-belt-to-ground.png	高速地下ベルトコンベア(Fast underground belt)	iron-gear-wheel.png*20, basic-transport-belt-to-ground.png*2	2			0.5
express-transport-belt-to-ground.png	超高速地下ベルトコンベア(Express underground belt)	iron-gear-wheel.png*40, fast-transport-belt-to-ground.png*2	2			0.5
basic-splitter.png	分配器(Splitter)	electronic-circuit.png*5, iron-plate.png*5, basic-transport-belt.png*4	1			1
fast-splitter.png	高速分配器(Fast splitter)	basic-splitter.png*1, iron-gear-wheel.png*10, electronic-circuit.png*10	1			2
express-splitter.png	超高速分配器(Express splitter)	fast-splitter.png*1, iron-gear-wheel.png*10, advanced-circuit.png*10, lubricant.png*8	1	assembling-machine-2.pngassembling-machine-3.png		2
pipe.png	パイプ(Pipe)	iron-plate.png*1	1			0.5
pipe-to-ground.png	地下パイプ(Pipe to ground)	pipe.png*10, iron-plate.png*5	2	地下パイプ含めて11マス		0.5
small-pump.png	小型ポンプ(Small pump)	electric-engine-unit.png*1, steel-plate.png*1, pipe.png*1	1			2
▲ ▼

インサータ  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
burner-inserter.png	燃料式インサータ(Burner inserter)	iron-plate.png*1, iron-gear-wheel.png*1	1			0.5
basic-inserter.png	インサータ(Inserter)	electronic-circuit.png*1, iron-gear-wheel.png*1, iron-plate.png*1	1			0.5
long-handed-inserter.png	ロングアームインサータ(Long handed inserter)	iron-gear-wheel.png*1, iron-plate.png*1, basic-inserter.png*1	1			0.5
fast-inserter.png	高速インサータ(Fast inserter)	electronic-circuit.png*2, iron-plate.png*2, basic-inserter.png*1	1			0.5
smart-inserter.png	スマートインサータ(Smart inserter)	fast-inserter.png*1, electronic-circuit.png*4	1			0.5

電柱・配線  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
small-electric-pole.png	小型電柱(Small electric pole)	wood.png*2, copper-cable.png*2	2			0.5
medium-electric-pole.png	中型電柱(Medium electric pole)	steel-plate.png*2, copper-plate.png*2	1			0.5
big-electric-pole.png	大型電柱(Big electric pole)	steel-plate.png*5, copper-plate.png*5	1			0.5
substation.png	変電所(Substation)	steel-plate.png*10, advanced-circuit.png*5, copper-plate.png*5	1			0.5
red-wire.png	レッドケーブル(Red wire)	electronic-circuit.png*1, copper-cable.png*1	1			0.5
green-wire.png	グリーンケーブル(Green wire)	electronic-circuit.png*1, copper-cable.png*1	1			0.5
arithmetic-combinator.png	算術回路(Arithmetic combinator)	copper-cable.png*5, electronic-circuit.png*5	1			0.5
decider-combinator.png	組み合わせ回路(Decider combinator)	copper-cable.png*5, electronic-circuit.png*5	1			0.5
constant-combinator.png	定数回路(Constant combinator)	copper-cable.png*5, electronic-circuit.png*2	1			0.5
▲ ▼
鉄道・車両  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
straight-rail.png	直線レール(Straight rail)	stone.png*1, iron-stick.png*1, steel-plate.png*1	2			0.5
curved-rail.png	曲線レール(Curved rail)	stone.png*4, iron-stick.png*4, steel-plate.png*4	2			0.5
train-stop.png	駅(Train stop)	electronic-circuit.png*5, iron-plate.png*10, steel-plate.png*3	1			0.5
rail-signal.png	信号(Rail signal)	electronic-circuit.png*1, iron-plate.png*5	1			0.5
rail-chain-signal.png	連動式列車用信号(Rail chain signal)	electronic-circuit.png*1, iron-plate.png*5	1			0.5
diesel-locomotive.png	ディーゼル機関車(Diesel locomotive)	engine-unit.png*20, electronic-circuit.png*10, steel-plate.png*30	1			0.5
cargo-wagon.png	貨物車両(Cargo wagon)	iron-gear-wheel.png*10, iron-plate.png*20, steel-plate.png*20	1			0.5
car.png	自動車(Car)	engine-unit.png*8, iron-plate.png*20, steel-plate.png*5	1		Enterで乗車	0.5
tank.png	戦車(Tank)	engine-unit.png*16, steel-plate.png*50, iron-gear-wheel.png*15, advanced-circuit.png*5	1		Enterで乗車	0.5
▲ ▼

▲ ▼
ロボ関連  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
logistic-robot.png	物流ロボット(Logistic robot)	flying-robot-frame.png*1, advanced-circuit.png*2	1			0.5
construction-robot.png	建造ロボット(Construction robot)	flying-robot-frame.png*1, electronic-circuit.png*2	1			0.5
roboport.png	ロボットステーション(Roboport)	steel-plate.png*45, iron-gear-wheel.png*45, advanced-circuit.png*45	1			15
▲ ▼
生産関係物  Edit

▲ ▼
採掘用具  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
iron-axe.png	鉄の斧(Iron axe)	iron-stick.png*2, iron-plate.png*3	1		装備品	0.5
steel-axe.png	鋼鉄の斧(Steel axe)	steel-plate.png*5, iron-stick.png*2	1		装備品	0.5
burner-mining-drill.png	燃料式掘削機(Burner mining drill)	iron-gear-wheel.png*3, stone-furnace.png*1, iron-plate.png*3	1		採掘は自身の下(2x2)	2
electric-mining-drill.png	電動掘削機(Electric mining drill)	electronic-circuit.png*3, iron-gear-wheel.png*5, iron-plate.png*10	1		採掘は自身と周囲1マス(5x5)	2
pumpjack.png	油井(Pumpjack)	steel-plate.png*15, iron-gear-wheel.png*10, electronic-circuit.png*10, pipe.png*10	1			20
▲ ▼
発電施設  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
offshore-pump.png	汲み上げポンプ(Offshore pump)	electronic-circuit.png*2, pipe.png*1, iron-gear-wheel.png*1	1			0.5
boiler.png	ボイラー(Boiler)	stone-furnace.png*1, pipe.png*1	1		汚染度 6	0.5
steam-engine.png	蒸気機関(Steam engine)	iron-gear-wheel.png*5, pipe.png*5, iron-plate.png*5	1		最大出力 510kw	0.5
solar-panel.png	ソーラーパネル(Solar panel)	steel-plate.png*5, electronic-circuit.png*15, copper-plate.png*5	1		最大出力 60kw	10
basic-accumulator.png	蓄電設備(Basic accumulator)	iron-plate.png*2, battery.png*5	1			10
▲ ▼






溶鉱炉  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
stone-furnace.png	石の炉(Stone furnace)	stone.png*5	1		汚染度 1.8	0.5
steel-furnace.png	鋼鉄の炉(Steel furnace)	steel-plate.png*8, stone-brick.png*10	1		汚染度 3.6	3
electric-furnace.png	電気炉(Electric furnace)	steel-plate.png*15, stone-brick.png*10, advanced-circuit.png*5	1		汚染度 0.9	5

組立機  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
assembling-machine-1.png	組立機1(Assembling machine 1)	iron-plate.png*9, iron-gear-wheel.png*5, electronic-circuit.png*3	1			0.5
assembling-machine-2.png	組立機2(Assembling machine 2)	assembling-machine-1.png*1, iron-plate.png*9, iron-gear-wheel.png*5, electronic-circuit.png*3	1		1でも作れるものは製作速度上昇	0.5
assembling-machine-3.png	組立機3(Assembling machine 3)	assembling-machine-2.png*2, speed-module.png*4	1		1、2でも作れるものは製作速度上昇	0.5



原油由来物精製施設  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
oil-refinery.png	原油精製所(Oil refinery)	steel-plate.png*15, iron-gear-wheel.png*10, stone-brick.png*10, electronic-circuit.png*10, pipe.png*10	1			20
chemical-plant.png	化学プラント(Chemical plant)	steel-plate.png*5, iron-gear-wheel.png*5, electronic-circuit.png*5, pipe.png*5	1			10

モジュール  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
speed-module.png	生産速度モジュール1(Speed module 1)	electronic-circuit.png*5, advanced-circuit.png*5	1		作業速度が向上。	15
speed-module-2.png	生産速度モジュール2(Speed module 2)	speed-module.png*4, advanced-circuit.png*5, processing-unit.png*5	1		作業速度が向上。	30
speed-module-3.png	生産速度モジュール3(Speed module 3)	speed-module-2.png*4, alien-artifact.png*1, advanced-circuit.png*5, processing-unit.png*5	1		作業速度が向上。	60
effectivity-module.png	エネルギー効率モジュール1(Effectivity module 1)	electronic-circuit.png*5, advanced-circuit.png*5	1		消費電力を最大80%低下。	15
effectivity-module-2.png	エネルギー効率モジュール2(Effectivity module 2)	effectivity-module.png*4, advanced-circuit.png*5, processing-unit.png*5	1		消費電力を最大80%低下。	30
effectivity-module-3.png	エネルギー効率モジュール3(Effectivity module 3)	effectivity-module-2.png*4, alien-artifact.png*1, advanced-circuit.png*5, processing-unit.png*5	1		消費電力を最大80%低下。	60
productivity-module.png	生産力モジュール1(Productivity module 1)	electronic-circuit.png*5, advanced-circuit.png*5	1		生産量が向上。	15
productivity-module-2.png	生産力モジュール2(Productivity module 2)	productivity-module.png*4, advanced-circuit.png*5, processing-unit.png*5	1		生産量が向上。	30
productivity-module-3.png	生産力モジュール3(Productivity module 3)	productivity-module-2.png*4, alien-artifact.png*1, advanced-circuit.png*5, processing-unit.png*5	1		生産量が向上。	60

その他の生産関係アイテム  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
repair-pack.png	リペアキット(Repair pack)	electronic-circuit.png*1, iron-gear-wheel.png*1	1		消耗品	1
blueprint.png	建造計画(Blueprint)	advanced-circuit.png*1	1			1
deconstruction-planner.png	解体プランナー(Deconstruction planner)	advanced-circuit.png*1	1			1
small-lamp.png	ランプ(Lamp)	iron-plate.png*1, iron-stick.png*3, electronic-circuit.png*1	1			1
lab.png	研究所(Lab)	basic-transport-belt.png*4, iron-gear-wheel.png*10, electronic-circuit.png*10	1			5
basic-beacon.png	基本ビーコン(Basic beacon)	steel-plate.png*10, electronic-circuit.png*20, advanced-circuit.png*20, copper-cable.png*10	1		モジュールを範囲内で共有することができる。	15
▲ ▼
戦闘関係  Edit

▲ ▼
装備武器  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
pistol.png	ハンドガン(Pistol)	copper-plate.png*5, iron-plate.png*5	1		装備品	1
submachine-gun.png	サブマシンガン(Submachine gun)	iron-gear-wheel.png*10, copper-plate.png*5, iron-plate.png*10	1		装備品	3
shotgun.png	ショットガン(Shotgun)	iron-plate.png*15, iron-gear-wheel.png*5, copper-plate.png*10, wood.png*5	1		装備品	4
combat-shotgun.png	コンバットショットガン(Combat shotgun)	steel-plate.png*15, iron-gear-wheel.png*5, copper-plate.png*10, wood.png*10	1		装備品	8
rocket-launcher.png	ロケットランチャー(Rocket launcher)	iron-plate.png*5, iron-gear-wheel.png*5, electronic-circuit.png*5	1		装備品	5
flame-thrower.png	火炎放射器(Flamethrower)	steel-plate.png*5, iron-gear-wheel.png*10	1		装備品	10
▲ ▼

▲ ▼
弾薬  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
basic-bullet-magazine.png	通常弾薬(Regular magazine)	iron-plate.png*2	1		装備品	2
piercing-bullet-magazine.png	貫通弾薬(Piercing rounds magazine)	copper-plate.png*5, steel-plate.png*1	1		装備品	3
shotgun-shell.png	ショットガン弾薬(Shotgun shells)	copper-plate.png*2, iron-plate.png*2	1		装備品	3
piercing-shotgun-shell.png	貫通ショットガン弾薬(Piercing shotgun shells)	copper-plate.png*2, steel-plate.png*2	1		装備品	8
rocket.png	ロケット(Rocket)	electronic-circuit.png*1, explosives.png*2, iron-plate.png*2	1		装備品	8
explosive-rocket.png	炸裂ロケット弾(Explosive rocket)	rocket.png*1, explosives.png*5	1		装備品	8
cannon-shell.png	砲弾(Cannon shell)	steel-plate.png*4, plastic-bar.png*2, explosives.png*1	1		装備品（戦車用）	8
explosive-cannon-shell.png	炸裂砲弾(Explosive cannon shell)	steel-plate.png*4, plastic-bar.png*2, explosives.png*4	1		装備品（戦車用）	8
flame-thrower-ammo.png	火炎放射器用燃料(Flamethrower ammo)	iron-plate.png*5, light-oil.png*2.5, heavy-oil.png*2.5	1	chemical-plant.png	装備品	3
▲ ▼
投擲武器  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
basic-grenade.png	手榴弾(Basic grenade)	iron-plate.png*5, coal.png*10	1			8
poison-capsule.png	毒素カプセル(Poison capsule)	steel-plate.png*3, electronic-circuit.png*3, coal.png*10	1			8
slowdown-capsule.png	粘着カプセル(Slowdown capsule)	steel-plate.png*2, electronic-circuit.png*2, coal.png*5	1			8
defender-capsule.png	ディフェンダーカプセル(Defender capsule)	piercing-bullet-magazine.png*1, electronic-circuit.png*2, iron-gear-wheel.png*3	1			8
distractor-capsule.png	ディストラクターカプセル(Distractor capsule)	defender-capsule.png*4, advanced-circuit.png*3	1			15
destroyer-capsule.png	デストロイヤーカプセル(Destroyer capsule)	distractor-capsule.png*4, speed-module.png*1	1			15

鎧  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
basic-armor.png	鉄の鎧(Iron armor)	iron-plate.png*40	1		装備品	3
heavy-armor.png	重鎧(Heavy armor)	copper-plate.png*100, steel-plate.png*50	1		装備品	8
basic-modular-armor.png	モジュラーアーマー(Basic modular armor)	advanced-circuit.png*30, processing-unit.png*5, steel-plate.png*50	1		装備品	15
power-armor.png	パワーアーマー(Power armor)	processing-unit.png*40, electric-engine-unit.png*20, steel-plate.png*40, alien-artifact.png*10	1		装備品	20
power-armor-mk2.png	パワーアーマーMK2(Power armor MK2)	effectivity-module-3.png*5, speed-module-3.png*5, processing-unit.png*40, steel-plate.png*40, alien-artifact.png*50	1		装備品	25

アーマーモジュール  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
solar-panel-equipment.png	携帯ソーラーパネルモジュール(Portable solar panel)	solar-panel.png*5, processing-unit.png*1, steel-plate.png*5	1		装備品	10
fusion-reactor-equipment.png	携帯核融合炉モジュール(Portable fusion reactor)	processing-unit.png*100, alien-artifact.png*30	1		装備品	10
energy-shield-equipment.png	エネルギーシールドモジュール(Energy shield)	advanced-circuit.png*5, steel-plate.png*10	1		装備品	10
energy-shield-mk2-equipment.png	エネルギーシールドモジュールMK2(Energy shield MK2)	energy-shield-equipment.png*10, processing-unit.png*10	1		装備品	10
battery-equipment.png	バッテリーモジュール(Battery)	battery.png*5, steel-plate.png*10	1		装備品	10
battery-mk2-equipment.png	バッテリーモジュールMK2(Battery MK2)	battery-equipment.png*10, processing-unit.png*20	1		装備品	10
basic-laser-defense-equipment.png	レーザー防御モジュール(Personal laser defense)	processing-unit.png*1, steel-plate.png*5, laser-turret.png*5	1		装備品	10
basic-exoskeleton-equipment.png	強化外骨格モジュール(Basic exoskeleton equipment)	processing-unit.png*10, electric-engine-unit.png*30, steel-plate.png*20	1		装備品	10
night-vision-equipment.png	暗視ゴーグル（モジュール式アーマー用）(Night vision)	advanced-circuit.png*5, steel-plate.png*10	1		装備品	10
basic-electric-discharge-defense-equipment.png	遠隔放電排除モジュール(Discharge defense)	processing-unit.png*5, steel-plate.png*20, laser-turret.png*10	1		装備品	10
personal-roboport-equipment.png	個人 ロボットステーション(Personal roboport)	processing-unit.png*10, iron-gear-wheel.png*40, steel-plate.png*20, battery.png*45	1		装備品	10
▲ ▼
タレット  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
gun-turret.png	ガンタレット(Gun turret)	iron-gear-wheel.png*10, copper-plate.png*10, iron-plate.png*20	1		射程距離 6マス	10
laser-turret.png	レーザータレット(Laser turret)	steel-plate.png*20, electronic-circuit.png*20, battery.png*12	1			20
▲ ▼

その他軍用品  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
land-mine.png	地雷(Land mine)	steel-plate.png*1, explosives.png*2	4			5
wall.png	石の防壁(Stone wall)	stone-brick.png*5	1			0.5
Gate.png	ゲート(Gate)	wall.png*1, steel-plate.png*2, electronic-circuit.png*2	1			0.5
radar.png	レーダー(Radar)	electronic-circuit.png*5, iron-gear-wheel.png*5, iron-plate.png*10	1			0.5
basic-electric-discharge-defense-equipment-ability.png	放電防衛装置リモコン(Basic electric discharge defense remote)	electronic-circuit.png*1	1			0.5
rocket-silo.png	ロケットサイロ(Rocket silo)	steel-plate.png*1000, concrete.png*1000, pipe.png*100, processing-unit.png*200, electric-engine-unit.png*200	1			30
▲ ▼
その他  Edit

アイコン	名称	レシピ	生成数	設備	備考	Time
rocket-part.png	ロケットパーツ(Rocket part)	rocket-structure.png*10,rocket-fuel.png*10,rocket-control-unit.png*10	1	rocket-silo.png	ロケット完成にはこのパーツが100個必要	3


"hand_mining" : {
	"icon" : "hand-mining.png",
  "name" : "手堀",
	"production_efficiency" : 1.0
},
{
"burner_mining_drill"  =>	%!"production_efficiency" : 1.0!,
"basic_mining_drill"   =>	%!"production_efficiency" : 0.5!,
"assembling_machine_1" =>	%!"production_efficiency" : 0.5!,
"assembling_machine_2" =>	%!"production_efficiency" : 0.75!,
"assembling_machine_3" =>	%!"production_efficiency" : 1.25!,
"stone_furnace"        =>	%!"production_efficiency" : 0.5!,
"steel_furnace"        =>	%!"production_efficiency" : 1.0!,
"electric_furnace"     =>	%!"production_efficiency" : 1.0!,
"chemical_plant"       =>	%!"production_efficiency" : 1.0!,
}
