#!/bin/bash
# File Name: shuangseqiu.sh
# Author: xixi
# Mail: joanoor@outlook.com
# Created Time: 2019年01月27日 星期日 20时24分35秒
# 本程序用于生成双色球号码，以供选择使用
declare -i times=6
declare -a red_numbers=("01" "02" "03" "04" "05" "06" "07" "08" "09" "10" "11" "12" "13" "14" "15" "16" "17" "18" "19" "20" "21" "22" "23" "24" "25" "26" "27" "28" "29" "30" "31" "32" "33")
declare -a blue_numbers=("01" "02" "03" "04" "05" "06" "07" "08" "09" "10" "11" "12" "13" "14" "15" "16")
FILE=spide_shuangseqiu.html
out_put=spide_tmp
declare -a day_array=([1]="星期一" [2]="星期二" [3]="星期三" [4]="星期四" [5]="星期五" [6]="星期六" [7]="星期日")
#清空系统中，程序运行过程所建立的缓存文件
#[ ls *shuangseqiu_tmp* > /dev/null ] && rm -f *shuangseqiu_tmp*
rm -f *shuangseqiu_tmp* *shuangseqiu.tmp* 2 > /dev/null
function generator(){
#	echo ${red_numbers[@]} | sed 's/ /\n/g' > shuangseqiu_tmp_red_numbers
	echo ${red_numbers[@]} | xargs -n1 > shuangseqiu_tmp_red_numbers
	for((i=0;i<times;i++))
	do
#		digit_red=$(wc -l<shuangseqiu_tmp_red_numbers)
		digit_red=${#red_numbers[@]}
		random_red_num=$(head -c4 /dev/urandom | od -N4 -tu4 | sed -ne '1s/.* //p')
		str=$(echo "${red_numbers[$((random_red_num%digit_red))]}")
		echo "$str" >> shuangseqiu_tmp_red_txt
		sed -i "/$str/d" shuangseqiu_tmp_red_numbers
		red_numbers=($(cat shuangseqiu_tmp_red_numbers))
	done

	sort -n shuangseqiu_tmp_red_txt -o shuangseqiu_tmp_tmp
	while read num
	do
		echo -n -e "\033[31m$num\033[0m "
	done < shuangseqiu_tmp_tmp

	digit_blue=${#blue_numbers[@]}
	random_blue_num=$(head -c4 /dev/urandom | od -N4 -tu4 | sed -ne '1s/.* //p')
	echo "${blue_numbers[$((random_blue_num%digit_blue))]}" > shuangseqiu_tmp_tmp
	blue_number=$(cat shuangseqiu_tmp_tmp)
	echo -e "\033[34m$blue_number\033[0m"

	rm -f *shuangseqiu_tmp_* 2>/dev/null
}
echo ""
echo "=================本程序用于生成双色球号码，以供选择使用================"
echo ""
echo "                       ######   ######   #######			  		     "
echo "                      ##    ## ##    ## ##     ##						 "
echo "                      ##       ##       ##     ##						 "
echo "                       ######   ######  ##     ##						 "
echo "                            ##       ## ##  ## ##						 "
echo "                      ##    ## ##    ## ##    ##						 "
echo "                       ######   ######   ##### ##						 "
echo ""
echo "======================================================================="
echo ""

order=3
pointer=0
while((pointer<order))
do
	read -t 10 -p "你想打印多少组双色球号码？请输入数字（默认是打印8888组，不能低于10组）: " REPLY
	echo ""
	REPLY=${REPLY:=12}

	if grep -q '^[[:digit:]]*$' <<< $REPLY && [ $REPLY -ge 10 ];then   # 这里<<<表示grep在REPLY变量中查找某字符
		pointer=3
	else
		echo "您输入的是非法字符或者输入的数字小于10"
		((pointer++))
		if [ $pointer -eq 3 ];then
			echo "三次输入的机会用完，程序自动退出！"
			break
		fi
		echo "你还有$((order-pointer))次机会！"
		continue
	fi

	for((n=0;n<$REPLY;n++))
	do
	#	(
		generator | tee -a shuangseqiu_tmp
	#	)&
	done 
	wait

	sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g" shuangseqiu_tmp > shuangseqiu_tmp_bak

	awk '{print $1,$2,$3,$4,$5,$6}' shuangseqiu_tmp_bak > shuangseqiu_tmp_red_data
	awk '{print $7}' shuangseqiu_tmp_bak > shuangseqiu_tmp_blue_data
	echo ""

	echo "经过统计，红色球中得出结论如下（按号码出现概率取前10个数字）: "
	echo "==========================================="
	for i in ${red_numbers[@]}
	do
		t=$(grep "$i" shuangseqiu_tmp_red_data | wc -l)
		f=$(echo "scale=2;$t / $REPLY" | bc)
		p=$(echo "scale=2;$f*100" | bc)
		echo "在本次打印中: ${i} 共出现 $t 次，概率为 $p%"
	done >> shuangseqiu_tmp_red
	sort -k4nr shuangseqiu_tmp_red | head -10 | tee shuangseqiu_tmp_r_red
	red_tmp_array=($(cat shuangseqiu_tmp_r_red | awk '{print $2}'))

	echo ""

	echo "经过统计，蓝色球中得出结论如下（按号码出现概率取前10个数字）：" 
	echo "==========================================="
	for i in ${blue_numbers[@]}
	do
		t=$(grep "$i" shuangseqiu_tmp_blue_data | wc -l)
		f=$(echo "scale=2;$t / $REPLY" | bc)
		p=$(echo "scale=2;$f*100" | bc)
		echo "在本次打印中: ${i} 共出现 $t 次，概率为 $p%" 
	done >> shuangseqiu_tmp_blue
	sort -k4nr shuangseqiu_tmp_blue | head -10 | tee shuangseqiu_tmp_r_blue
	blue_tmp_array=($(cat shuangseqiu_tmp_r_blue | awk '{print $2}'))

	#len=${#red_tmp_array[@]}

	declare -a shuangseqiu_array
	for((f=0;f<$REPLY;f++))
	do
		read line
		shuangseqiu_array[$f]="$line"
	done <shuangseqiu_tmp
	len=${#shuangseqiu_array[@]}
	today=$(date | cut -d' ' -f4)

	if [ "$today" = "星期一" ]
	then
		offset=1
	elif [ "$today" = "星期二" ]
	then
		offset=2
	elif [ "$today" = "星期三" ]
	then
		offset=3
	elif [ "$today" = "星期四" ]
	then
		offset=4
	elif [ "$today" = "星期五" ]
	then
		offset=5
	elif [ "$today" = "星期六" ]
	then
		offset=6
	else
		offset=7
	fi

	echo ""
	echo "根据得出的结论，为你推荐以下七组双色球号码："
	echo "==========================================="
	for((a=0;a<7;a++))
	do
		red_numbers=("${red_tmp_array[@]}")
		blue_numbers=("${blue_tmp_array[@]}")
		generator
	#	random_num=$(head -c4 /dev/urandom | od -N4 -tu4 | sed -ne '1s/.* //p')
	#	index=$((random_num%len))
	#	if [ $index -lt 1 ]
	#	then
	#		shuangseqiu_array_new=("${shuangseqiu_array[@]}")
	#	else
	#		shuangseqiu_array_new=("${shuangseqiu_array[@]:$index}" "${shuangseqiu_array[@]:0:$index}")
	#	fi
	#	echo ${shuangseqiu_array_new[$offset]}
	done > suppose_shuangseqiu.tmp
	cat suppose_shuangseqiu.tmp
	sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g" suppose_shuangseqiu.tmp > suppose_shuangseqiu.tmp_bak
	echo ""
	str_tmp=$(sed -n "$offset"p suppose_shuangseqiu.tmp_bak)
	echo "今天是$today，今天重点推荐该组双色球号码："
	echo -e "\033[1;30;41m"${str_tmp}"\033[0m"
	
	# 发送推送到微信上
	# PUSH_KEY="*******************"
	# title=$(date +"%Y年%m月%d日")——双色球推荐号码
	# curl -X GET "https://sctapi.ftqq.com/$PUSH_KEY.send?title=$title&desp=$str_tmp"

	echo "==========================================="

	function spide(){
		for((n=1;n<=48;n++))
		do
			curl "http://www.ahfc.gov.cn/cp.php?type=ssq&page=${n}"
		done >> $FILE
		cat $FILE | grep -oP '(?<=color: #ff0000\">)(\d\d\s){5}\d\d\+\d\d(?=</td>)' | sed 's/+/ /g' > $out_put
		rm -f $FILE
	}

	echo ""

	echo "是否将推荐号码与历年双色球开奖号码进行对比？（这一步需要联网操作）"
	read -t 10 -p "请输入yes或者no（默认是no）: " yn
	echo ""
	yn=${yn:="no"}

	count=0
	if [ "$yn" == "yes" ]
	then
		spide
		while read line
		do
			if grep -q "$line" $out_put
			then
				grep "$line" $out_put
				count++
			else
				:
			fi
		done < suppose_shuangseqiu.tmp_bak
		[ $count -gt 0 ] && echo "推荐号码与历年双色球开奖号码有 $count 次匹配!"
		[ $count -eq 0 ] && echo "推荐号码与历年双色球开奖号码没有匹配！"
	elif [ "$yn" == "no" ]
	then
		echo "程序执行完毕!"
	fi
	#####################
	# 当运行在github action上时，这句注释掉
	# rm -f *shuangseqiu_tmp* *shuangseqiu.tmp* $out_put 2>/dev/null
	##################### 
done
